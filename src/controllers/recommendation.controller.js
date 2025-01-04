const Movie = require('../models/movie.model');
const User = require('../models/user.model');

/**
 * Get movie recommendations for a user based on their preferences
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Recommended movies
 */
exports.getRecommendations = async (req, res) => {
  try {
    // Fetch user with preferences
    const user = await User.findById(req.user._id).populate('wishlist watchedMovies');
    const { favoriteGenres, favoriteActors, favoriteDirectors, contentRating, languages } = user.preferences;

    // Build the query based on user preferences
    const query = {
      $or: [
        { genre: { $in: favoriteGenres } }, // Match favorite genres
        { 'cast.actor.name': { $in: favoriteActors } }, // Match favorite actors
        { 'crew.name': { $in: favoriteDirectors } } // Match favorite directors
      ],
      _id: { $nin: user.watchedMovies }, // Exclude watched movies
      ...(contentRating.length > 0 && { 'ageRating.rating': { $in: contentRating } }), // Match content ratings
      ...(languages.length > 0 && { 'technicalSpecs.language': { $in: languages } }) // Match languages
    };

    // Find recommended movies based on user preferences
    const recommendedMovies = await Movie.find(query).limit(10);

    res.json(recommendedMovies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get similar movies based on a given movie
 * @param {Object} req - Express request object
 * @param {string} req.params.movieId - ID of the movie to find similar movies for
 * @param {Object} res - Express response object
 * @returns {Object} Similar movies
 */
exports.getSimilarTitles = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);

    // Find movies with similar genres or the same director
    const similarMovies = await Movie.find({
      $or: [
        { genre: { $in: movie.genre } },
        { director: movie.director }
      ],
      _id: { $ne: movieId } // Exclude the current movie
    }).limit(5);

    res.json(similarMovies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get trending movies based on recent ratings or activity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Trending movies
 */
exports.getTrendingMovies = async (req, res) => {
  try {
    // Find movies sorted by recent ratings or activity, could be based on a "views" or "ratings" field
    const trendingMovies = await Movie.find().sort({ views: -1, rating: -1 }).limit(10);
    res.json(trendingMovies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get top rated movies across all genres
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Top rated movies
 */
exports.getTopRatedMovies = async (req, res) => {
  try {
    // Find the highest-rated movies across all genres
    const topRatedMovies = await Movie.find().sort({ rating: -1 }).limit(10);
    res.json(topRatedMovies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
