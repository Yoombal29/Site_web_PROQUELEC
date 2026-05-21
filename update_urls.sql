-- SQL Script to replace absolute URLs with relative paths in PostgreSQL
-- This script updates all upload URLs to use relative paths instead

-- Update pages table - meta_hero_image
UPDATE pages 
SET meta_hero_image = REPLACE(
    REPLACE(
        REPLACE(meta_hero_image, 'http://localhost:3000/uploads/', '/uploads/'),
        'http://localhost:3010/uploads/', '/uploads/'
    ),
    'https://localhost/uploads/', '/uploads/'
)
WHERE meta_hero_image LIKE '%localhost%/uploads/%';

-- Update pages table - featured_image
UPDATE pages 
SET featured_image = REPLACE(
    REPLACE(
        REPLACE(featured_image, 'http://localhost:3000/uploads/', '/uploads/'),
        'http://localhost:3010/uploads/', '/uploads/'
    ),
    'https://localhost/uploads/', '/uploads/'
)
WHERE featured_image LIKE '%localhost%/uploads/%';

-- Update blog_posts table - cover_image_url
UPDATE blog_posts 
SET cover_image_url = REPLACE(
    REPLACE(
        REPLACE(cover_image_url, 'http://localhost:3000/uploads/', '/uploads/'),
        'http://localhost:3010/uploads/', '/uploads/'
    ),
    'https://localhost/uploads/', '/uploads/'
)
WHERE cover_image_url LIKE '%localhost%/uploads/%';

-- Update gallery_items table - image_url
UPDATE gallery_items 
SET image_url = REPLACE(
    REPLACE(
        REPLACE(image_url, 'http://localhost:3000/uploads/', '/uploads/'),
        'http://localhost:3010/uploads/', '/uploads/'
    ),
    'https://localhost/uploads/', '/uploads/'
)
WHERE image_url LIKE '%localhost%/uploads/%';

-- Update media_files table - file_path
UPDATE media_files 
SET file_path = REPLACE(
    REPLACE(
        REPLACE(file_path, 'http://localhost:3000/uploads/', '/uploads/'),
        'http://localhost:3010/uploads/', '/uploads/'
    ),
    'https://localhost/uploads/', '/uploads/'
)
WHERE file_path LIKE '%localhost%/uploads/%';

-- General updates for any other columns with upload URLs
-- Update content columns in blog_posts
UPDATE blog_posts 
SET content = REPLACE(
    REPLACE(
        REPLACE(content, 'http://localhost:3000/uploads/', '/uploads/'),
        'http://localhost:3010/uploads/', '/uploads/'
    ),
    'https://localhost/uploads/', '/uploads/'
)
WHERE content LIKE '%localhost%/uploads/%';

-- Update pages table - content column if it exists
UPDATE pages 
SET content = REPLACE(
    REPLACE(
        REPLACE(content, 'http://localhost:3000/uploads/', '/uploads/'),
        'http://localhost:3010/uploads/', '/uploads/'
    ),
    'https://localhost/uploads/', '/uploads/'
)
WHERE content LIKE '%localhost%/uploads/%';

-- Summary of changes
SELECT 
    'pages.meta_hero_image' as column_updated,
    COUNT(*) as records_affected
FROM pages 
WHERE meta_hero_image LIKE '%/uploads/%' AND meta_hero_image NOT LIKE '%localhost%/uploads/%'
UNION ALL
SELECT 
    'pages.featured_image',
    COUNT(*)
FROM pages 
WHERE featured_image LIKE '%/uploads/%' AND featured_image NOT LIKE '%localhost%/uploads/%'
UNION ALL
SELECT 
    'blog_posts.cover_image_url',
    COUNT(*)
FROM blog_posts 
WHERE cover_image_url LIKE '%/uploads/%' AND cover_image_url NOT LIKE '%localhost%/uploads/%'
UNION ALL
SELECT 
    'gallery_items.image_url',
    COUNT(*)
FROM gallery_items 
WHERE image_url LIKE '%/uploads/%' AND image_url NOT LIKE '%localhost%/uploads/%'
UNION ALL
SELECT 
    'media_files.file_path',
    COUNT(*)
FROM media_files 
WHERE file_path LIKE '%/uploads/%' AND file_path NOT LIKE '%localhost%/uploads/%';
