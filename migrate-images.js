require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');

// Import your Article model
const Article = require('./models/Article');

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Mongo Error:", err));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrateImages() {
  try {
    const articles = await Article.find();

    for (let article of articles) {

      // Skip if already Cloudinary image
      if (!article.coverImage || article.coverImage.startsWith('http')) {
        continue;
      }

      const localImagePath = path.join(__dirname, 'uploads', article.coverImage);

      if (!fs.existsSync(localImagePath)) {
        console.log(`Image not found locally: ${article.coverImage}`);
        continue;
      }

      console.log(`Uploading: ${article.coverImage}`);

      const result = await cloudinary.uploader.upload(localImagePath, {
        folder: 'blog_images',
      });

      // Update DB with new Cloudinary URL
      article.coverImage = result.secure_url;
      await article.save();

      console.log(`Updated: ${article.title}`);
    }

    console.log("🎉 Migration Completed!");
    process.exit();

  } catch (err) {
    console.error("Migration Error:", err);
    process.exit(1);
  }
}

migrateImages();
