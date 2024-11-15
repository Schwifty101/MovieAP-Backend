const Review = require('../models/review.model');
const Movie = require('../models/movie.model');

exports.createReview = async (req, res) => {
  try {
    const { movieId, rating, review } = req.body;
    const userId = req.user._id;

    const existingReview = await Review.findOne({ user: userId, movie: movieId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    const newReview = await Review.create({
      user: userId,
      movie: movieId,
      rating,
      review
    });

    // Update movie average rating
    const movie = await Movie.findById(movieId);
    const allReviews = await Review.find({ movie: movieId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    movie.averageRating = totalRating / allReviews.length;
    movie.totalRatings = allReviews.length;
    await movie.save();

    res.status(201).json({
      status: 'success',
      data: { review: newReview }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ movie: movieId })
      .populate('user', 'username')
      .sort('-likes -createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ movie: movieId });

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review } = req.body;

    const updatedReview = await Review.findOneAndUpdate(
      { _id: reviewId, user: req.user._id },
      { rating, review, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    res.status(200).json({
      status: 'success',
      data: { review: updatedReview }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};