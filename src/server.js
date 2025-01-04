// Load environment variables from .env file into process.env
require('dotenv').config();

// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Import email configuration
require('./config/email.config');


// Import route handlers
const authRoutes = require('./routes/auth.routes');
const profileroutes = require('./routes/profile.routes');
const movieRoutes = require('./routes/movie.routes');
const reviewRoutes = require('./routes/review.routes');
const recommendationRoutes = require('./routes/recommendations.routes');
const newsArticleRoutes = require('./routes/newsarticle.routes');

const listRoutes = require('./routes/list.routes');
const discussionRoutes = require('./routes/discussion.routes');
const adminRoutes = require('./routes/admin.routes');


// Import custom error handling middleware
const { errorHandler } = require('./middleware/error.middleware');

// Import cron job configuration
require('./config/cronjob.config');  // Importing the cron job configuration


// Initialize Express application
const app = express();

// Security middleware configuration
// helmet: Adds various HTTP headers to help protect the app
app.use(helmet());
// cors: Enable Cross-Origin Resource Sharing
app.use(cors());
// express.json: Parse incoming JSON payloads
app.use(express.json());

// Configure rate limiting to prevent abuse
// Limits each IP to 100 requests per 15 minute window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100 // Maximum 100 requests per windowMs
});
app.use(limiter);

// Mount Swagger UI for API documentation
// Available at /api-docs endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount route handlers
// Each route is prefixed with /api and its respective resource name
app.use('/api/auth', authRoutes);        // Authentication routes
app.use('/api/profile', profileroutes);  // User profile routes
app.use('/api/movies', movieRoutes);      // Movie management routes
app.use('/api/reviews', reviewRoutes);    // Movie review routes
app.use('/api/lists', listRoutes);        // User movie lists routes
app.use('/api/discussions', discussionRoutes); // Movie discussions routes
app.use('/api/recommendations', recommendationRoutes); // Movie recommendations routes
app.use('/api/newsarticles', newsArticleRoutes); // News articles routes
app.use('/api/admin', adminRoutes); // Admin routes

// Global error handling middleware
// Catches and processes all errors thrown in the application
app.use(errorHandler);

// Initialize MongoDB connection
// Uses connection string from environment variables or falls back to local database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moviedb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});