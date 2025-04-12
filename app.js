// app.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const path = require('path');
const Article = require('./models/Article');
const User = require('./models/User');
const Message = require('./models/Message');
const { Console } = require('console');

require('dotenv').config();
// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Mongoose connection status
const db = mongoose.connection;

db.on('connected', () => {
  console.log('MongoDB connected successfully');
});

db.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});



app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
}));

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());




// Passport configuration
require('./config/passport-config')(passport);

// Google login route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

// Middleware to check if user is authenticated and authorized
function ensureAuthenticatedAndAuthorized(req, res, next) {
  if (req.isAuthenticated()) {
    const userGoogleId = req.user.googleId;  // Ensure consistency with `googleId`
    console.log("User Google ID from middleware:", userGoogleId);  // Log for debugging
    console.log("Allowed Google IDs (middleware):", allowedUsers); // Log allowed users

    if (allowedUsers.includes(userGoogleId)) {
      return next();  // User is allowed
    } else {
      console.log("Authenticated but not authorized");  // Debugging log
      return res.redirect('/');  // Authenticated but not authorized
    }
  }
  console.log("User not authenticated");  // Debugging log
  res.redirect('/');  // Not authenticated
}

// Add detailed logging after Google authentication callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const userGoogleId = req.user ? req.user.googleId : 'No User';
    console.log("User Google ID (from session):", userGoogleId);
    console.log("Current session data:", req.session);

    if (allowedUsers.includes(userGoogleId)) {
      console.log("User is authorized.");
      res.redirect('/admin');
    } else {
      console.log("User is NOT authorized.");
      res.redirect('/');
    }
  }
);

//Define the isAuthenticated route 
app.get('/isAuthenticated', (req, res) => {
  if (req.isAuthenticated()) {
      // Send back the user's display name along with the authenticated status
      res.json({ isAuthenticated: true, displayName: req.user.displayName });
  } else {
      res.json({ isAuthenticated: false });
  }
});

// Define the isAuthorized route
app.get('/isAuthorized', (req, res) => {
  if (req.isAuthenticated()) {
    const isAuthorized = allowedUsers.includes(req.user.googleId);
    res.json({ isAuthorized });
  } else {
    res.json({ isAuthorized: false });
  }
});

// Define an array of allowed Google IDs
const allowedUsers = ['102288906508007241851', 'GOOGLE_ID_2','117333328488046231454']; 



// Set up Multer for file upload
const storage = multer.diskStorage({
  destination: 'uploads/', // Ensure this folder exists
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb('Error: Images only!');
  },
  limits: { fileSize: 1 * 1024 * 1024 }, // Limit: 1 MB
});



// Routes

// Admin Login Page
// app.get('/login', (req, res) => {
//   res.send(`
//     <form method="post" action="/login">
//       <input name="username" placeholder="Username" required/>
//       <input name="password" type="password" placeholder="Password" required/>
//       <button type="submit">Login</button>
//     </form>
//     <a href="/auth/google">Login with Google</a> <!-- Link for Google Login -->
//   `);
// });


// Handle Login
// app.post('/login', passport.authenticate('local', {
//   successRedirect: '/uploadarticle',
//   failureRedirect: '/login',
// }));

// Logout route
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.log('Session destruction error:', err);
        return res.status(500).json({ error: 'Session destruction error' });
      }
      res.redirect('/'); // Redirect to home page after logging out
    });
  });
});



const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } 
  res.status(401).json({ message: 'Unauthorized: Please log in to send a message' });
};

// API endpoint to handle contact form submission
app.post('/api/contact', ensureAuthenticated, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'تمام خانے مکمل کریں' });
    }

    // Create a new message document
    const newMessage = new Message({
      name,
      email,
      message,
      userId: req.user._id, // Associate the message with the authenticated user
    });

    await newMessage.save();

    res.status(201).json({ success: true, message: 'آپ کا پیغام ہمیں موصول ہو گیا ہے۔' });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to get all contact messages (for admin)
app.get('/api/contact/messages', ensureAuthenticated, async (req, res) => {
  try {
    // Fetch all messages from the database
    const messages = await Message.find().populate('userId', 'name email'); // If you want to include user details

    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Route to render articles and users
app.get('/admin', ensureAuthenticatedAndAuthorized, async (req, res) => {
  try {
      const articles = await Article.find({}); // Retrieve all articles
      const users = await User.find({});       // Retrieve all users
      res.sendFile(path.join(__dirname, 'admin.html')); // Serve the admin.html file
    } catch (err) {
      console.error(`Error fetching admin data: ${err}`);
      res.status(500).send('Server Error');
  }
});

// API endpoint to fetch articles for admin
app.get('/api/admin/articles', ensureAuthenticatedAndAuthorized, async (req, res) => {
  try {
    const articles = await Article.find({});
    res.json(articles);
  } catch (err) {
    console.error(`Error fetching articles: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to fetch user data for admin
app.get('/api/admin/users', ensureAuthenticatedAndAuthorized, async (req, res) => {
  try {
    const users = await User.find().select('displayName googleId profilePicture'); // Adjust fields as needed
    res.json(users);
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// API endpoint to fetch articles for index
app.get('/api/public/articles', async (req, res) => {
  try {
    const articles = await Article.find({});
    res.json(articles);
  } catch (err) {
    console.error(`Error fetching public articles: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to fetch articles by category
app.get('/api/public/articles/category', async (req, res) => {
  try {
    const category = req.query.category;
    const query = category === 'all' ? {} : { category };
    const articles = await Article.find(query);
    res.json(articles);
  } catch (err) {
    console.error(`Error fetching articles by category: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Toggle article favorite status
app.post('/api/admin/articles/favorite', ensureAuthenticatedAndAuthorized, async (req, res) => {
  try {
      const { articleId } = req.body;
      const article = await Article.findById(articleId);

      if (!article) {
          return res.status(404).json({ success: false, message: 'Article not found' });
      }

      // Toggle favorite status and update favorite sequence if it's favorited
      if (article.isFavorite) {
          article.isFavorite = false;
          article.favoriteSequence = undefined;
      } else {
          const favoritesCount = await Article.countDocuments({ isFavorite: true });
          if (favoritesCount >= 11) {
              return res.json({ success: false, message: 'Maximum of 11 favorites reached. Unfavorite an article to add a new one.' });
          }
          article.isFavorite = true;
          article.favoriteSequence = favoritesCount + 1;
      }

      await article.save();
      const updatedFavorites = await Article.find({ isFavorite: true }).sort('favoriteSequence').select('_id favoriteSequence');
      res.json({ success: true, favorites: updatedFavorites });
  } catch (err) {
      console.error("Error updating favorite status:", err);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

  // API endpoint to fetch favorite articles for the frontend
app.get('/api/admin/favorite-articles',  async (req, res) => {
  try {
    const favoriteArticles = await Article.find({ isFavorite: true })
      .sort({ favoriteSequence: 1 }) // Sort by sequence number
      .select('_id title favoriteSequence'); // Retrieve only necessary fields

    res.json(favoriteArticles);
  } catch (err) {
    console.error("Error fetching favorite articles:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// API endpoint to search articles with pagination
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    // Search by title, content, author, hashtags, or category (case-insensitive)
    const articles = await Article.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { hashtags: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('title coverImage createdAt content author hashtags category');

    const totalArticles = await Article.countDocuments({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { hashtags: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    });

    res.json({
      articles,
      totalArticles, // Include this line to send the total count
      totalPages: Math.ceil(totalArticles / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(`Error fetching search results: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Delete Article
app.get('/delete/:id', ensureAuthenticatedAndAuthorized, async (req, res) => {
  try {
      await Article.findByIdAndDelete(req.params.id);
      res.redirect('/admin');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

// Serve the edit article page
app.get('/editArticle/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'editArticle.html'));
});

// API endpoint to fetch a specific article by ID
app.get('/api/admin/articles/:id', ensureAuthenticatedAndAuthorized, async (req, res) => {
  try {
      const article = await Article.findById(req.params.id);
      if (!article) {
          return res.status(404).json({ error: 'Article not found' });
      }
      res.json(article);
  } catch (err) {
      console.error(`Error fetching article: ${err}`);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Article Endpoint
app.post('/edit-article/:id', upload.single('coverImage'), async (req, res) => {
  const articleId = req.params.id;
  const { title, hashtags = '', category, content, author } = req.body;

  // Log request body to debug if values are received correctly
  console.log("Received data to update:", { title, hashtags, category, content, author });

  // Handle file upload for cover image if provided
  let coverImage;
  if (req.file) {
      coverImage = req.file.filename; // Use multer to save the file
      console.log("Cover image file name:", coverImage);
  }

  try {
      const updatedArticle = await Article.findByIdAndUpdate(
          articleId,
          {
              title,
              hashtags: hashtags ? hashtags.split(',').map(tag => tag.trim()) : [],
              category,
              content,
              author,
              ...(coverImage && { coverImage })
          },
          { new: true }
      );

      if (updatedArticle) {
          console.log("Article updated successfully:", updatedArticle);
          res.redirect('/admin');
      } else {
          console.log("Article not found");
          res.status(404).send('Article not found');
      }
  } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).send('Server error');
  }
});





// Fetch paginated articles
app.get('/api/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;  // 6 articles per page
    const skip = (page - 1) * limit;

    // Fetch the articles from the database, sorted by creation date
    const articles = await Article.find()
      .sort({ createdAt: -1 })  // Sort by newest first
      .skip(skip)
      .limit(limit)
      .select('title coverImage createdAt content')  // Select only needed fields

    // Get the total number of articles
    const totalArticles = await Article.countDocuments();

    res.json({
      articles,
      totalPages: Math.ceil(totalArticles / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(`Error fetching articles: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch single article by ID with additional fields
app.get('/api/articles/:id', async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findById(articleId).select('title coverImage createdAt content author');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (err) {
    console.error(`Error fetching article: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});





// API endpoint to get recent articles
app.get('/api/recent-articles', async (req, res) => {
  try {
      const recentArticles = await Article.find()
          .sort({ createdAt: -1 }) // Sort by creation date, newest first
          .limit(5); // Limit to the most recent 5 articles

      res.json({ articles: recentArticles });
  } catch (error) {
      console.error("Error fetching recent articles: ", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

// API endpoint to get recent articles For the index page
app.get('/api/recent-articles/index', async (req, res) => {
  try {
      const articles = await Article.find().sort({ createdAt: -1 }).limit(3); // Fetch the 3 most recent articles
      res.json({ articles });
  } catch (error) {
      console.error("Error fetching recent articles for index: ", error);
      res.status(500).json({ message: "Error fetching recent articles for index" });
  }
});

// Protect the /uploadarticle route
app.get('/uploadarticle', ensureAuthenticatedAndAuthorized, (req, res) => {
  res.sendFile(path.join(__dirname, 'uploadArticle.html'));
});


// Handle Article Upload
app.post('/upload-article', ensureAuthenticatedAndAuthorized, upload.single('coverImage'), async (req, res) => {  //ensureAuthenticated,
  try {
    const { title, hashtags, category, content, author } = req.body;
    const coverImage = req.file ? req.file.filename : '';

    // Create a new article instance
    const newArticle = new Article({
      title,
      hashtags: hashtags.split(',').map(tag => tag.trim()),
      category,
      content,
      coverImage,
      author,
    });

    // Save the article to the database
    await newArticle.save();
    
    // Redirect back to the form or another page after success
    res.redirect('/uploadarticle?success=true');

  } catch (err) {
    console.error(`Error uploading article: ${err}`);
    res.redirect('/uploadarticle?error=true');
  }
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve index.html from root when the root URL is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


