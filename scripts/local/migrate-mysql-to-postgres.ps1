# ETL idempotente: MySQL adm_libare -> PostgreSQL adm_libare_core (schema core).
# Requer: MySQL 8 (root/admin), PostgreSQL 18 (postgres/admin), schema core ja aplicado (Flyway V1-V3).
# Uso (worktree feat/postgres-migration):
#   cd C:\Users\User\Repository\adm-wt-postgres
#   powershell -ExecutionPolicy Bypass -File .\scripts\local\migrate-mysql-to-postgres.ps1

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

function Invoke-PgSql([string]$Sql) {
    $psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
    if (-not (Test-Path $psql)) { throw "psql.exe nao encontrado em $psql" }
    $env:PGPASSWORD = $PgPassword
    $env:PGCLIENTENCODING = "UTF8"
    $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
    [System.IO.File]::WriteAllText($tempFile, $Sql, [System.Text.UTF8Encoding]::new($false))
    try {
        $out = & $psql -h $PgHost -p $PgPort -U $PgUser -d $PgDatabase -v ON_ERROR_STOP=1 -f $tempFile 2>&1
    } finally {
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    }
    if ($LASTEXITCODE -ne 0) { throw "PostgreSQL falhou: $out" }
    return $out
}

function Invoke-PgFile([string]$Path) {
    $psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
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

$hasCommentStatus = (Invoke-MySqlQuery @"
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_comments' AND COLUMN_NAME = 'status';
"@).Trim() -eq "1"
if (-not $hasCommentStatus) {
    Write-Host "  [AVISO] tbl_comments sem coluna status — assumindo todos ativos (1)" -ForegroundColor Yellow
}
$commentStatusExpr = if ($hasCommentStatus) { "IF(c.status='0',0,1)" } else { "1" }

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
SELECT author_id, TRIM(author_name), IFNULL(author_description,''), IF(a_status='0',0,1)
FROM tbl_author
WHERE author_name IS NOT NULL AND TRIM(author_name) <> '';
"@
$authorCount = 0
foreach ($line in ($authorLines -split "`n" | Where-Object { $_.Trim() -ne "" })) {
    $p = $line -split "`t"
    $legacyId = $p[0]; $name = $p[1]; $bio = $p[2]; $active = if ($p[3] -eq "1") { "TRUE" } else { "FALSE" }
    $bioSql = if ([string]::IsNullOrWhiteSpace($bio)) { "NULL" } else { Escape-Pg $bio }
    Invoke-PgSql @"
INSERT INTO catalog_authors (legacy_author_id, author_type, name, bio, is_active)
VALUES ($legacyId, 'BOOK', $(Escape-Pg $name), $bioSql, $active)
ON CONFLICT (legacy_author_id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, is_active = EXCLUDED.is_active;
"@ | Out-Null
    $authorCount++
}
Write-Host "  autores: $authorCount"

# --- Admins ---
Write-Step "Migrando admins..."
$adminLines = Invoke-MySqlQuery @"
SELECT id, TRIM(username), password
FROM tbl_admin
WHERE username IS NOT NULL AND TRIM(username) <> '';
"@
$adminCount = 0
foreach ($line in ($adminLines -split "`n" | Where-Object { $_.Trim() -ne "" })) {
    $p = $line -split "`t"
    $legacyId = $p[0]; $username = $p[1]; $hash = $p[2]
    $algo = if ($hash.Length -eq 32) { "MD5" } else { "BCRYPT" }
    Invoke-PgSql @"
INSERT INTO app_admin_users (legacy_admin_id, username, password_hash, password_algorithm, is_active)
VALUES ($legacyId, $(Escape-Pg $username), $(Escape-Pg $hash), '$algo', TRUE)
ON CONFLICT (username) DO UPDATE SET
  legacy_admin_id = EXCLUDED.legacy_admin_id,
  password_hash = EXCLUDED.password_hash,
  password_algorithm = EXCLUDED.password_algorithm,
  is_active = TRUE;
"@ | Out-Null
    $adminCount++
}
Write-Host "  admins: $adminCount"

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

# --- Livros (JSON evita quebra por tabs/newlines em descricoes) ---
Write-Step "Migrando livros..."
$bookJsonLines = Invoke-MySqlQuery @"
SELECT JSON_OBJECT(
  'id', b.id,
  'title', TRIM(b.book_title),
  'cat_id', IFNULL(b.cat_id, ''),
  'aid', IFNULL(b.aid, 0),
  'description', IFNULL(b.book_description, ''),
  'file_type', IFNULL(TRIM(b.book_file_type), ''),
  'file_url', IFNULL(TRIM(b.book_file_url), ''),
  'featured', IF(b.featured=1,1,0),
  'views', IFNULL(b.book_views, 0),
  'status', IF(b.status='0',0,1)
)
FROM tbl_books b
WHERE b.book_title IS NOT NULL AND TRIM(b.book_title) <> '';
"@
$bookCount = 0
foreach ($line in ($bookJsonLines -split "`n" | Where-Object { $_.Trim() -ne "" })) {
    $b = $line.Trim() | ConvertFrom-Json
    $legacyId = [long]$b.id
    $title = [string]$b.title
    $catLegacy = [string]$b.cat_id
    $authorLegacy = [long]$b.aid
    $desc = if ([string]::IsNullOrWhiteSpace([string]$b.description)) { "NULL" } else { Escape-Pg ([string]$b.description) }
    $fileType = if ([string]::IsNullOrWhiteSpace([string]$b.file_type)) { "NULL" } else { Escape-Pg ([string]$b.file_type) }
    $fileUrl = if ([string]::IsNullOrWhiteSpace([string]$b.file_url)) { "NULL" } else { Escape-Pg ([string]$b.file_url) }
    $featured = if ([int]$b.featured -eq 1) { "TRUE" } else { "FALSE" }
    $views = [int]$b.views
    $active = if ([int]$b.status -eq 1) { "TRUE" } else { "FALSE" }
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
INSERT INTO catalog_books (legacy_book_id, title, normalized_title, category_id, author_id, description, file_type, file_url, is_featured, views, is_active)
VALUES ($legacyId, $(Escape-Pg $title), $normTitle, $catSql, $authorSql, $desc, $fileType, $fileUrl, $featured, $views, $active)
ON CONFLICT (legacy_book_id) DO UPDATE SET
  title = EXCLUDED.title, normalized_title = EXCLUDED.normalized_title,
  category_id = EXCLUDED.category_id, author_id = EXCLUDED.author_id,
  description = EXCLUDED.description, file_type = EXCLUDED.file_type, file_url = EXCLUDED.file_url,
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
