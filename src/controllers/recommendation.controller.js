const Movie = require('../models/movie.model');
const Review = require('../models/review.model');
const User = require('../models/user.model');

exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    // Get user's favorite genres and rated movies
    const userReviews = await Review.find({ user: userId }).populate('movie');
    const ratedMovieIds = userReviews.map(review => review.movie._id);
    
    // Find similar movies based on genres and ratings
    const recommendations = await Movie.find({
      _id: { $nin: ratedMovieIds },
      genre: { $in: user.preferences.favoriteGenres },
      averageRating: { $gte: 4 }
    })
    .limit(10)
    .sort('-averageRating -totalRatings');

    res.status(200).json({
      status: 'success',
      data: { recommendations }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getSimilarMovies = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);

    const similarMovies = await Movie.find({
      _id: { $ne: movieId },
      $or: [
        { genre: { $in: movie.genre } },
        { director: movie.director }
      ]
    })
    .limit(5)
    .sort('-averageRating');

    res.status(200).json({
      status: 'success',
      data: { similarMovies }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getTrendingMovies = async (req, res) => {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const trendingMovies = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: '$movie',
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { totalReviews: -1, averageRating: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const movieIds = trendingMovies.map(item => item._id);
    const movies = await Movie.find({ _id: { $in: movieIds } });

    res.status(200).json({
      status: 'success',
      data: { trendingMovies: movies }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};