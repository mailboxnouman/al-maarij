// models/Article.js
const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  hashtags: [String],
  category: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isFavorite: { type: Boolean, default: false }, // New field for favorite status
  favoriteSequence: { type: Number, default: null }, // New field for favorite sequence number
});

module.exports = mongoose.model('Article', ArticleSchema);
