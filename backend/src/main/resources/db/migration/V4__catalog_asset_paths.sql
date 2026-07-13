-- Paths de assets legados (capas/imagens) espelhando tbl_books.book_cover_img e tbl_author.author_image
ALTER TABLE catalog_books
  ADD COLUMN IF NOT EXISTS cover_image VARCHAR(255) NULL;

ALTER TABLE catalog_authors
  ADD COLUMN IF NOT EXISTS image_path VARCHAR(255) NULL;
