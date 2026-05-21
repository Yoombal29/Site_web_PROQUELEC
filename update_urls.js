const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: "postgres",
  password: "proquelec_secure_db_pass",
  host: "127.0.0.1",
  port: 5437,
  database: "postgres"
});

const updateQueries = [
  "UPDATE pages SET meta_hero_image = REPLACE(REPLACE(REPLACE(meta_hero_image, 'http://localhost:3000/uploads/', '/uploads/'), 'http://localhost:3010/uploads/', '/uploads/'), 'https://localhost/uploads/', '/uploads/') WHERE meta_hero_image LIKE '%localhost%/uploads/%'",
  "UPDATE pages SET featured_image = REPLACE(REPLACE(REPLACE(featured_image, 'http://localhost:3000/uploads/', '/uploads/'), 'http://localhost:3010/uploads/', '/uploads/'), 'https://localhost/uploads/', '/uploads/') WHERE featured_image LIKE '%localhost%/uploads/%'",
  "UPDATE blog_posts SET cover_image_url = REPLACE(REPLACE(REPLACE(cover_image_url, 'http://localhost:3000/uploads/', '/uploads/'), 'http://localhost:3010/uploads/', '/uploads/'), 'https://localhost/uploads/', '/uploads/') WHERE cover_image_url LIKE '%localhost%/uploads/%'",
  "UPDATE gallery_items SET image_url = REPLACE(REPLACE(REPLACE(image_url, 'http://localhost:3000/uploads/', '/uploads/'), 'http://localhost:3010/uploads/', '/uploads/'), 'https://localhost/uploads/', '/uploads/') WHERE image_url LIKE '%localhost%/uploads/%'",
  "UPDATE media_files SET file_path = REPLACE(REPLACE(REPLACE(file_path, 'http://localhost:3000/uploads/', '/uploads/'), 'http://localhost:3010/uploads/', '/uploads/'), 'https://localhost/uploads/', '/uploads/') WHERE file_path LIKE '%localhost%/uploads/%'",
  "UPDATE blog_posts SET content = REPLACE(REPLACE(REPLACE(content, 'http://localhost:3000/uploads/', '/uploads/'), 'http://localhost:3010/uploads/', '/uploads/'), 'https://localhost/uploads/', '/uploads/') WHERE content LIKE '%localhost%/uploads/%'",
  "UPDATE pages SET content = REPLACE(REPLACE(REPLACE(content, 'http://localhost:3000/uploads/', '/uploads/'), 'http://localhost:3010/uploads/', '/uploads/'), 'https://localhost/uploads/', '/uploads/') WHERE content LIKE '%localhost%/uploads/%'"
];

async function executeUpdates() {
  try {
    console.log("Connecting to PostgreSQL database...");
    const client = await pool.connect();
    
    console.log("\nExecuting URL update queries...\n");
    
    for (let i = 0; i < updateQueries.length; i++) {
      try {
        const result = await client.query(updateQueries[i]);
        console.log(`Query ${i + 1}: ${result.rowCount} rows updated`);
      } catch (err) {
        console.log(`Query ${i + 1}: ${err.message.substring(0, 60)}`);
      }
    }
    
    console.log("\n===== SUMMARY OF CHANGES =====\n");
    
    const summaryQueries = [
      { table: "pages.meta_hero_image", query: "SELECT COUNT(*) as count FROM pages WHERE meta_hero_image LIKE '%/uploads/%' AND meta_hero_image NOT LIKE '%localhost%/uploads/%'" },
      { table: "pages.featured_image", query: "SELECT COUNT(*) as count FROM pages WHERE featured_image LIKE '%/uploads/%' AND featured_image NOT LIKE '%localhost%/uploads/%'" },
      { table: "blog_posts.cover_image_url", query: "SELECT COUNT(*) as count FROM blog_posts WHERE cover_image_url LIKE '%/uploads/%' AND cover_image_url NOT LIKE '%localhost%/uploads/%'" },
      { table: "gallery_items.image_url", query: "SELECT COUNT(*) as count FROM gallery_items WHERE image_url LIKE '%/uploads/%' AND image_url NOT LIKE '%localhost%/uploads/%'" },
      { table: "media_files.file_path", query: "SELECT COUNT(*) as count FROM media_files WHERE file_path LIKE '%/uploads/%' AND file_path NOT LIKE '%localhost%/uploads/%'" }
    ];
    
    for (const summary of summaryQueries) {
      try {
        const result = await client.query(summary.query);
        console.log(`${summary.table}: ${result.rows[0].count} records with relative URLs`);
      } catch (err) {
        console.log(`${summary.table}: Table may not exist`);
      }
    }
    
    client.release();
    console.log("\nDatabase update completed successfully!");
    process.exit(0);
    
  } catch (err) {
    console.error("Connection error:", err.message);
    process.exit(1);
  }
}

executeUpdates();
