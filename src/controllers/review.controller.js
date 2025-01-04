const Review = require('../models/review.model');
const Movie = require('../models/movie.model');

/**
 * Create a new movie review
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing review data
 * @param {string} req.body.movieId - ID of movie being reviewed
 * @param {number} req.body.rating - Rating from 1-5
 * @param {string} req.body.comment - Review text content
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Created review object
 */
exports.createReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const userId = req.user._id;

    const review = new Review({
      user: userId,
      movie: movieId,
      rating,
      comment
    });

    await review.save();

    // Update movie's average rating
    const reviews = await Review.find({ movie: movieId });
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await Movie.findByIdAndUpdate(movieId, {
      averageRating: avgRating,
      totalRatings: reviews.length
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get paginated reviews for a specific movie
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Number of reviews per page
 * @param {string} req.params.movieId - ID of movie to get reviews for
 * @param {Object} res - Express response object
 * @returns {Object} Paginated reviews with metadata
 */
exports.getMovieReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const movieId = req.params.movieId;

    const reviews = await Review.find({ movie: movieId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Review.countDocuments({ movie: movieId });

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all reviews
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} All reviews with user and movie details
 */
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username email')
      .populate('movie', 'title genre');

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve reviews', error: error });
  }
};

/**
 * Update an existing review
 * Only allows updating by the original review author
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing updated review data
 * @param {number} req.body.rating - Updated rating
 * @param {string} req.body.comment - Updated review text
 * @param {string} req.params.id - ID of review to update
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated review object
 */
exports.updateReview = async (req, res) => {
  try {
    // Extract rating and comment from request body
    const { rating, comment } = req.body;
    // Find the review first
    const review = await Review.findOne({ _id: req.params.id });

    // Check if the review exists
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is the review owner or an admin
    if (!(review.user.toString() === req.user._id.toString() || req.user.role === 'admin')) {
      return res.status(403).json({ message: 'Unauthorized to update review' });
    }

    // Update the review, returning the updated version
    const updatedReview = await Review.findOneAndUpdate(
      { _id: req.params.id },
      { rating, comment, updatedAt: Date.now() },
      { new: true }
    );

    // Update movie's average rating
    const reviews = await Review.find({ movie: updatedReview.movie });
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    // Update the movie with the new average rating
    await Movie.findByIdAndUpdate(updatedReview.movie, {
      averageRating: avgRating
    });

    // Return the updated review
    res.json(updatedReview);
  } catch (error) {
    // Return 400 Bad Request for validation/client errors
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete an existing review
 * Only allows deletion by the original review author
 * @param {Object} req - Express request object 
 * @param {string} req.params.id - ID of review to delete
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is the review owner or an admin
    if (!(review.user.toString() === req.user._id.toString() || req.user.role === 'admin')) {
      return res.status(403).json({ message: 'Unauthorized to delete review' });
    }

    // Delete the review
    await Review.deleteOne({ _id: review._id });

    // Update movie's average rating
    const reviews = await Review.find({ movie: review.movie });
    const avgRating = reviews.length ? 
      reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length : 0;

    await Movie.findByIdAndUpdate(review.movie, {
      averageRating: avgRating,
      totalRatings: reviews.length
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};