const User = require('../models/user.model');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('wishlist', 'title coverImage');

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, preferences } = req.body;

    // Prevent password update through this route
    if (req.body.password) {
      return res.status(400).json({
        status: 'error',
        message: 'This route is not for password updates'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, preferences },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'title coverImage genre releaseDate');

    res.status(200).json({
      status: 'success',
      data: { wishlist: user.wishlist }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user.wishlist.includes(movieId)) {
      user.wishlist.push(movieId);
      await user.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Movie added to wishlist'
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(id => id.toString() !== movieId);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Movie removed from wishlist'
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};