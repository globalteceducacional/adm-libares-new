# ETL idempotente: MySQL adm_libare -> PostgreSQL adm_libare_core (schema core).
# Requer: MySQL 8 (root/admin), PostgreSQL 18 (postgres/admin), schema core ja aplicado (Flyway V1-V3).
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\local\migrate-mysql-to-postgres.ps1

param(
    [string]$MySqlHost = "127.0.0.1",
    [int]$MySqlPort = 3306,
    [string]$MySqlUser = "root",
    [string]$MySqlPassword = "admin",
    [string]$MySqlDatabase = "adm_libare",
    [string]$PgHost = "127.0.0.1",
    [int]$PgPort = 5432,
    [string]$PgUser = "postgres",
    [string]$PgPassword = "admin",
    [string]$PgDatabase = "adm_libare_core"
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) { Write-Host "==> $Message" -ForegroundColor Cyan }

function Escape-Pg([string]$Value) {
    if ($null -eq $Value) { return "NULL" }
    $clean = ($Value -replace "[\r\n\t]+", " ").Trim()
    return "'" + ($clean -replace "'", "''") + "'"
}

function Invoke-MySqlQuery([string]$Sql) {
    $mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    if (-not (Test-Path $mysql)) { throw "mysql.exe nao encontrado em $mysql" }
    $env:MYSQL_PWD = $MySqlPassword
    $prevEncoding = [Console]::OutputEncoding
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    try {
        $raw = & $mysql --default-character-set=utf8mb4 -h $MySqlHost -P $MySqlPort -u $MySqlUser $MySqlDatabase -N -B -e $Sql 2>&1
    } finally {
        [Console]::OutputEncoding = $prevEncoding
    }
    if ($LASTEXITCODE -ne 0) { throw "MySQL falhou: $raw" }
    return $raw
}

function Get-PsqlPath {
    $candidates = @(
        "C:\Program Files\PostgreSQL\18\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { return $c }
    }
    throw "psql.exe nao encontrado. Instale PostgreSQL client ou ajuste o caminho."
}

function Invoke-PgSql([string]$Sql) {
    $psql = Get-PsqlPath
    $env:PGPASSWORD = $PgPassword
    $env:PGCLIENTENCODING = "UTF8"
    $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
    [System.IO.File]::WriteAllText($tempFile, $Sql, [System.Text.UTF8Encoding]::new($false))
    try {
        $out = & $psql -h $PgHost -p $PgPort -U $PgUser -d $PgDatabase -v ON_ERROR_STOP=1 -t -A -f $tempFile 2>&1
    } finally {
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    }
    if ($LASTEXITCODE -ne 0) { throw "PostgreSQL falhou: $out" }
    return ($out | Out-String)
}

function Invoke-PgFile([string]$Path) {
    $psql = Get-PsqlPath
    $env:PGPASSWORD = $PgPassword
    $out = & $psql -h $PgHost -p $PgPort -U $PgUser -d $PgDatabase -v ON_ERROR_STOP=1 -f $Path 2>&1
    if ($LASTEXITCODE -ne 0) { throw "PostgreSQL falhou ao executar $Path : $out" }
}

function Reset-CoreData {
    Write-Step "Limpando dados migraveis (preserva schema + seed admin Flyway)..."
    $sql = @"
TRUNCATE TABLE
  engagement_comments,
  catalog_books,
  app_user_activity_logs,
  app_user_identities,
  app_users,
  catalog_authors,
  catalog_categories,
  app_settings,
  ops_migration_runs
RESTART IDENTITY CASCADE;
"@
    Invoke-PgSql $sql | Out-Null
}

function Sync-Sequences {
    Write-Step "Sincronizando sequences..."
    $tables = @(
        "app_admin_users", "app_users", "catalog_categories", "catalog_authors",
        "catalog_books", "engagement_comments", "app_settings", "app_user_activity_logs"
    )
    foreach ($t in $tables) {
        Invoke-PgSql "SELECT setval(pg_get_serial_sequence('$t', 'id'), COALESCE((SELECT MAX(id) FROM $t), 1));" | Out-Null
    }
}

Write-Step "Iniciando ETL MySQL -> PostgreSQL"
Reset-CoreData

function Convert-FromHex([string]$Hex) {
    if ([string]::IsNullOrWhiteSpace($Hex) -or $Hex -eq "NULL") { return "" }
    if (($Hex.Length % 2) -ne 0) { return "" }
    $bytes = for ($i = 0; $i -lt $Hex.Length; $i += 2) { [Convert]::ToByte($Hex.Substring($i, 2), 16) }
    return [System.Text.Encoding]::UTF8.GetString([byte[]]$bytes)
}

$hasCommentStatus = (
    Invoke-MySqlQuery @"
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_comments' AND COLUMN_NAME = 'status';
"@
).Trim() -eq "1"
if (-not $hasCommentStatus) {
    Write-Host "  [AVISO] tbl_comments sem coluna status - assumindo todos ativos (1)" -ForegroundColor Yellow
}
$commentStatusExpr = if ($hasCommentStatus) { 'IF(c.status=''0'',0,1)' } else { "1" }

# --- Categorias ---
Write-Step "Migrando categorias..."
$catLines = Invoke-MySqlQuery @"
SELECT cid, TRIM(category_name), IF(cat_status=0,0,1)
FROM tbl_category
WHERE category_name IS NOT NULL AND TRIM(category_name) <> '';
"@
$catCount = 0
foreach ($line in ($catLines -split "`n" | Where-Object { $_.Trim() -ne "" })) {
    $p = $line -split "`t"
    $legacyId = $p[0]; $name = $p[1]; $active = if ($p[2] -eq "1") { "TRUE" } else { "FALSE" }
    $slug = ($name.ToLower() -replace '\s+', '-')
    Invoke-PgSql @"
INSERT INTO catalog_categories (legacy_category_id, category_type, name, slug, is_active)
VALUES ($legacyId, 'BOOK', $(Escape-Pg $name), $(Escape-Pg $slug), $active)
ON CONFLICT (legacy_category_id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, is_active = EXCLUDED.is_active;
"@ | Out-Null
    $catCount++
}
Write-Host "  categorias: $catCount"

# --- Autores ---
Write-Step "Migrando autores..."
$authorLines = Invoke-MySqlQuery @"
SELECT author_id, TRIM(author_name), IFNULL(author_description,''), IF(a_status='0',0,1),
  HEX(IFNULL(TRIM(author_image),''))
FROM tbl_author
WHERE author_name IS NOT NULL AND TRIM(author_name) <> '';
"@
$authorCount = 0
foreach ($line in ($authorLines -split "`n" | Where-Object { $_.Trim() -ne "" })) {
    $p = $line -split "`t"
    $legacyId = $p[0]; $name = $p[1]; $bio = $p[2]; $active = if ($p[3] -eq "1") { "TRUE" } else { "FALSE" }
    $bioSql = if ([string]::IsNullOrWhiteSpace($bio)) { "NULL" } else { Escape-Pg $bio }
    $imgRaw = if ($p.Count -gt 4) { Convert-FromHex $p[4] } else { "" }
    $imgSql = if ([string]::IsNullOrWhiteSpace($imgRaw)) { "NULL" } else { Escape-Pg $imgRaw }
    Invoke-PgSql @"
INSERT INTO catalog_authors (legacy_author_id, author_type, name, bio, image_path, is_active)
VALUES ($legacyId, 'BOOK', $(Escape-Pg $name), $bioSql, $imgSql, $active)
ON CONFLICT (legacy_author_id) DO UPDATE SET
  name = EXCLUDED.name, bio = EXCLUDED.bio, image_path = EXCLUDED.image_path, is_active = EXCLUDED.is_active;
"@ | Out-Null
    $authorCount++
}
Write-Host "  autores: $authorCount"

# --- Admins (tbl_admin legado OU app_admin_users multi-tenant) ---
Write-Step "Migrando admins..."
$adminTable = (Invoke-MySqlQuery @"
SELECT TABLE_NAME FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('tbl_admin','app_admin_users')
ORDER BY CASE TABLE_NAME WHEN 'app_admin_users' THEN 0 ELSE 1 END
LIMIT 1;
"@).Trim()

$adminCount = 0
if ($adminTable -eq "app_admin_users") {
    $adminLines = Invoke-MySqlQuery @"
SELECT id, TRIM(username), password_hash, IF(status='0',0,1)
FROM app_admin_users
WHERE username IS NOT NULL AND TRIM(username) <> '';
"@
} elseif ($adminTable -eq "tbl_admin") {
    $adminLines = Invoke-MySqlQuery @"
SELECT id, TRIM(username), password, 1
FROM tbl_admin
WHERE username IS NOT NULL AND TRIM(username) <> '';
"@
} else {
    Write-Host "  [AVISO] Nenhuma tabela de admin encontrada - pulando" -ForegroundColor Yellow
    $adminLines = ""
}

foreach ($line in ($adminLines -split "`n" | Where-Object { $_.Trim() -ne "" })) {
    $p = $line -split "`t"
    $legacyId = $p[0]; $username = $p[1]; $hash = $p[2]
    $active = if ($p.Count -gt 3 -and $p[3] -eq "0") { "FALSE" } else { "TRUE" }
    $algo = if ($hash.StartsWith('$2')) { "BCRYPT" } elseif ($hash.Length -eq 32) { "MD5" } else { "BCRYPT" }
    Invoke-PgSql @"
INSERT INTO app_admin_users (legacy_admin_id, username, password_hash, password_algorithm, is_active)
VALUES ($legacyId, $(Escape-Pg $username), $(Escape-Pg $hash), '$algo', $active)
ON CONFLICT (username) DO UPDATE SET
  legacy_admin_id = EXCLUDED.legacy_admin_id,
  password_hash = EXCLUDED.password_hash,
  password_algorithm = EXCLUDED.password_algorithm,
  is_active = EXCLUDED.is_active;
"@ | Out-Null
    $adminCount++
}
Write-Host "  admins: $adminCount (fonte: $adminTable)"

# --- Usuarios (dedup por email) ---
Write-Step "Migrando usuarios..."
$userLines = Invoke-MySqlQuery @"
SELECT su.id, COALESCE(NULLIF(TRIM(su.name),''), CONCAT('Usuario ', su.id)),
  LOWER(TRIM(su.email)), IFNULL(su.phone,''), IFNULL(su.password,''),
  COALESCE(NULLIF(TRIM(su.user_type),''), 'Normal'), IF(su.status='0',0,1),
  IFNULL(su.user_image,''), IFNULL(su.acervo_id,0)
FROM tbl_users su
INNER JOIN (
  SELECT LOWER(TRIM(email)) AS em, MAX(id) AS chosen_id
  FROM tbl_users WHERE email IS NOT NULL AND TRIM(email) <> ''
  GROUP BY LOWER(TRIM(email))
) d ON d.chosen_id = su.id;
"@
$userCount = 0
foreach ($line in ($userLines -split "`n" | Where-Object { $_.Trim() -ne "" })) {
    $p = $line -split "`t", 9
    $legacyId = $p[0]; $name = $p[1]; $email = $p[2]
    $phone = if ([string]::IsNullOrWhiteSpace($p[3])) { "NULL" } else { Escape-Pg $p[3] }
    $pwd = if ([string]::IsNullOrWhiteSpace($p[4])) { "NULL" } else { Escape-Pg $p[4] }
    $userType = $p[5]; $active = if ($p[6] -eq "1") { "TRUE" } else { "FALSE" }
    $avatar = if ([string]::IsNullOrWhiteSpace($p[7])) { "NULL" } else { Escape-Pg $p[7] }
    $acervo = if ($p[8] -eq "0" -or [string]::IsNullOrWhiteSpace($p[8])) { "NULL" } else { $p[8] }
    Invoke-PgSql @"
INSERT INTO app_users (legacy_user_id, display_name, email, phone, password_hash, user_type, is_active, avatar_ref, acervo_id)
VALUES ($legacyId, $(Escape-Pg $name), $(Escape-Pg $email), $phone, $pwd, $(Escape-Pg $userType), $active, $avatar, $acervo)
ON CONFLICT (email) DO UPDATE SET
  legacy_user_id = EXCLUDED.legacy_user_id,
  display_name = EXCLUDED.display_name,
  phone = EXCLUDED.phone,
  user_type = EXCLUDED.user_type,
  is_active = EXCLUDED.is_active,
  avatar_ref = EXCLUDED.avatar_ref,
  acervo_id = EXCLUDED.acervo_id;
"@ | Out-Null
    $userCount++
}
Write-Host "  usuarios: $userCount"

# --- Livros (HEX evita quebra de JSON por aspas/HTML) ---
Write-Step "Migrando livros..."
$bookLines = Invoke-MySqlQuery @"
SELECT b.id,
  HEX(TRIM(b.book_title)),
  IFNULL(b.cat_id, ''),
  IFNULL(b.aid, 0),
  HEX(IFNULL(b.book_description, '')),
  HEX(IFNULL(TRIM(b.book_file_type), '')),
  HEX(IFNULL(TRIM(b.book_file_url), '')),
  IF(b.featured=1,1,0),
  IFNULL(b.book_views, 0),
  IF(b.status='0',0,1),
  HEX(IFNULL(TRIM(b.book_cover_img), ''))
FROM tbl_books b
WHERE b.book_title IS NOT NULL AND TRIM(b.book_title) <> '';
"@
$bookCount = 0
foreach ($line in ($bookLines -split "`n" | Where-Object { $_.Trim() -ne "" })) {
    $p = $line -split "`t", 11
    if ($p.Count -lt 11) { Write-Warning "Linha de livro ignorada (colunas insuficientes)"; continue }
    $legacyId = [long]$p[0]
    $title = Convert-FromHex $p[1]
    $catLegacy = [string]$p[2]
    $authorLegacy = [long]$p[3]
    $descRaw = Convert-FromHex $p[4]
    $fileTypeRaw = Convert-FromHex $p[5]
    $fileUrlRaw = Convert-FromHex $p[6]
    $coverRaw = Convert-FromHex $p[10]
    $desc = if ([string]::IsNullOrWhiteSpace($descRaw)) { "NULL" } else { Escape-Pg $descRaw }
    $fileType = if ([string]::IsNullOrWhiteSpace($fileTypeRaw)) { "NULL" } else { Escape-Pg $fileTypeRaw }
    $fileUrl = if ([string]::IsNullOrWhiteSpace($fileUrlRaw)) { "NULL" } else { Escape-Pg $fileUrlRaw }
    $coverSql = if ([string]::IsNullOrWhiteSpace($coverRaw)) { "NULL" } else { Escape-Pg $coverRaw }
    $featured = if ($p[7] -eq "1") { "TRUE" } else { "FALSE" }
    $views = [int]$p[8]
    $active = if ($p[9] -eq "1") { "TRUE" } else { "FALSE" }
    $normTitle = Escape-Pg ($title.ToLower().Trim())
    $catSql = "NULL"
    if ($catLegacy -and $catLegacy.Trim() -ne "" -and $catLegacy -ne "0") {
        $catLegacyNum = ($catLegacy -replace '[^0-9]', '')
        if ($catLegacyNum) {
            $catSql = "(SELECT id FROM catalog_categories WHERE legacy_category_id = $catLegacyNum LIMIT 1)"
        }
    }
    $authorSql = "NULL"
    if ($authorLegacy -gt 0) {
        $authorSql = "(SELECT id FROM catalog_authors WHERE legacy_author_id = $authorLegacy LIMIT 1)"
    }
    Invoke-PgSql @"
INSERT INTO catalog_books (legacy_book_id, title, normalized_title, category_id, author_id, description, file_type, file_url, cover_image, is_featured, views, is_active)
VALUES ($legacyId, $(Escape-Pg $title), $normTitle, $catSql, $authorSql, $desc, $fileType, $fileUrl, $coverSql, $featured, $views, $active)
ON CONFLICT (legacy_book_id) DO UPDATE SET
  title = EXCLUDED.title, normalized_title = EXCLUDED.normalized_title,
  category_id = EXCLUDED.category_id, author_id = EXCLUDED.author_id,
  description = EXCLUDED.description, file_type = EXCLUDED.file_type, file_url = EXCLUDED.file_url,
  cover_image = EXCLUDED.cover_image,
  is_featured = EXCLUDED.is_featured, views = EXCLUDED.views, is_active = EXCLUDED.is_active;
"@ | Out-Null
    $bookCount++
}
Write-Host "  livros: $bookCount"

# --- Comentarios (JSON) ---
Write-Step "Migrando comentarios..."
$commentJsonLines = Invoke-MySqlQuery @"
SELECT JSON_OBJECT(
  'id', c.id,
  'book_id', c.book_id,
  'user_id', IFNULL(c.user_id, 0),
  'user_name', IFNULL(c.user_name, ''),
  'user_email', IFNULL(c.user_email, ''),
  'comment_text', c.comment_text,
  'epoch', CASE WHEN NULLIF(TRIM(c.comment_on),'') IS NOT NULL AND TRIM(c.comment_on) REGEXP '^[0-9]+$'
                THEN TRIM(c.comment_on) ELSE UNIX_TIMESTAMP(c.dt_rate) END,
  'status', $commentStatusExpr
)
FROM tbl_comments c
WHERE c.comment_text IS NOT NULL AND TRIM(c.comment_text) <> '';
"@
$commentCount = 0
$commentSkipped = 0
foreach ($line in ($commentJsonLines -split "`n" | Where-Object { $_.Trim() -ne "" })) {
    $c = $line.Trim() | ConvertFrom-Json
    $legacyId = [long]$c.id
    $bookLegacy = [long]$c.book_id
    $userLegacy = [long]$c.user_id
    $userName = if ([string]::IsNullOrWhiteSpace([string]$c.user_name)) { "NULL" } else { Escape-Pg ([string]$c.user_name) }
    $userEmail = if ([string]::IsNullOrWhiteSpace([string]$c.user_email)) { "NULL" } else { Escape-Pg ([string]$c.user_email) }
    $text = Escape-Pg ([string]$c.comment_text)
    $epoch = if ($null -eq $c.epoch -or [string]$c.epoch -eq "") { "NULL" } else { [string]$c.epoch }
    $active = if ([int]$c.status -eq 1) { "TRUE" } else { "FALSE" }
    $userSql = "NULL"
    if ($userLegacy -gt 0) {
        $userSql = "(SELECT id FROM app_users WHERE legacy_user_id = $userLegacy LIMIT 1)"
    }
    $bookPgId = (Invoke-PgSql "SELECT id FROM catalog_books WHERE legacy_book_id = $bookLegacy LIMIT 1;").Trim()
    if (-not $bookPgId -or $bookPgId -eq "") {
        Write-Warning "Comentario $legacyId ignorado (livro legacy $bookLegacy ausente no PostgreSQL)"
        $commentSkipped++
        continue
    }
    try {
        Invoke-PgSql @"
INSERT INTO engagement_comments (legacy_comment_id, book_id, user_id, user_name, user_email, comment_text, commented_at_epoch, is_active)
VALUES ($legacyId, $bookPgId, $userSql, $userName, $userEmail, $text, $epoch, $active)
ON CONFLICT (legacy_comment_id) DO UPDATE SET
  book_id = EXCLUDED.book_id, user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name,
  user_email = EXCLUDED.user_email, comment_text = EXCLUDED.comment_text,
  commented_at_epoch = EXCLUDED.commented_at_epoch, is_active = EXCLUDED.is_active;
"@ | Out-Null
        $commentCount++
    } catch {
        Write-Warning "Comentario $legacyId falhou: $_"
        $commentSkipped++
    }
}
Write-Host "  comentarios: $commentCount (ignorados: $commentSkipped)"

Sync-Sequences

Write-Step "Contagens finais no PostgreSQL:"
Invoke-PgSql @"
SELECT 'app_admin_users' AS t, COUNT(*) FROM app_admin_users
UNION ALL SELECT 'app_users', COUNT(*) FROM app_users
UNION ALL SELECT 'catalog_categories', COUNT(*) FROM catalog_categories
UNION ALL SELECT 'catalog_authors', COUNT(*) FROM catalog_authors
UNION ALL SELECT 'catalog_books', COUNT(*) FROM catalog_books
UNION ALL SELECT 'engagement_comments', COUNT(*) FROM engagement_comments;
"@

Write-Step "ETL concluido."
