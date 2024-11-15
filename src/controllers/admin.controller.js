const Analytics = require('../models/analytics.model');
const Movie = require('../models/movie.model');
const User = require('../models/user.model');
const Review = require('../models/review.model');
const Discussion = require('../models/discussion.model');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: lastMonth } });
    const totalReviews = await Review.countDocuments();
    const newReviews = await Review.countDocuments({ createdAt: { $gte: lastMonth } });

    const popularGenres = await Movie.aggregate([
      { $unwind: '$genre' },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const analytics = await Analytics.create({
      metrics: {
        totalUsers,
        newUsers,
        totalReviews,
        newReviews,
        popularGenres: popularGenres.map(g => ({ genre: g._id, count: g.count }))
      }
    });

    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.moderateContent = async (req, res) => {
  try {
    const { contentId, contentType, action } = req.body;

    let result;
    switch (contentType) {
      case 'review':
        result = await Review.findByIdAndUpdate(
          contentId,
          { isHidden: action === 'hide' },
          { new: true }
        );
        break;
      case 'discussion':
        result = await Discussion.findByIdAndUpdate(
          contentId,
          { isLocked: action === 'lock' },
          { new: true }
        );
        break;
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }

    if (!result) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { result }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};