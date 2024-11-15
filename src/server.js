const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const connectDB = require('./config/database');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const movieRoutes = require('./routes/movie.routes');
const reviewRoutes = require('./routes/review.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const listRoutes = require('./routes/list.routes');
const searchRoutes = require('./routes/search.routes');
const boxOfficeRoutes = require('./routes/boxOffice.routes');
const discussionRoutes = require('./routes/discussion.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// API Routes
const apiV1 = '/api/v1';
app.use(`${apiV1}/auth`, authRoutes);
app.use(`${apiV1}/users`, userRoutes);
app.use(`${apiV1}/movies`, movieRoutes);
app.use(`${apiV1}/reviews`, reviewRoutes);
app.use(`${apiV1}/recommendations`, recommendationRoutes);
app.use(`${apiV1}/lists`, listRoutes);
app.use(`${apiV1}/search`, searchRoutes);
app.use(`${apiV1}/boxOffice`, boxOfficeRoutes);
app.use(`${apiV1}/discussions`, discussionRoutes);
app.use(`${apiV1}/admin`, adminRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  
  res.status(statusCode).json({
    status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});