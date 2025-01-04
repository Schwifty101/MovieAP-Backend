/**
 * @fileoverview Profile controller handling user profile management operations
 * Contains functions for viewing, updating, and deleting user profiles,
 * managing user preferences, and handling wishlist operations.
 */

const User = require('../models/user.model.js');
const mongoose = require('mongoose');

/**
 * Retrieves the user profile information excluding the password
 * @param {Object} req - Express request object containing user ID in req.user
 * @param {Object} res - Express response object
 * @returns {Object} User profile data or error message
 */
const viewUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile', error });
  }
};

/**
 * Updates user profile information like username and email
 * @param {Object} req - Express request object containing update data in body
 * @param {Object} res - Express response object
 * @returns {Object} Updated user data or error message
 */
const updateUserProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const updatedData = {};

    if (username) updatedData.username = username;
    if (email) updatedData.email = email;

    const user = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

/**
 * Permanently deletes a user profile from the database
 * @param {Object} req - Express request object containing user ID
 * @param {Object} res - Express response object
 * @returns {Object} Success message or error message
 */
const deleteUserProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'User profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile', error });
  }
};

/**
 * Retrieves user preferences including favorite genres, actors, directors, etc.
 * @param {Object} req - Express request object containing user ID
 * @param {Object} res - Express response object
 * @returns {Object} User preferences or error message
 */
const viewUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving preferences', error });
  }
};

/**
 * Updates user preferences with new values
 * @param {Object} req - Express request object containing preference data
 * @param {Object} res - Express response object
 * @returns {Object} Updated preferences or error message
 */
const updateUserPreferences = async (req, res) => {
  try {
    const { favoriteGenres, favoriteActors, favoriteDirectors, contentRating, languages } = req.body;

    const updatedPreferences = {
      favoriteGenres,
      favoriteActors,
      favoriteDirectors,
      contentRating,
      languages,
    };

    const user = await User.findByIdAndUpdate(req.user.id, { preferences: updatedPreferences }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Preferences updated successfully', preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error });
  }
};

/**
 * Retrieves user's movie wishlist with populated movie details
 * @param {Object} req - Express request object containing user ID
 * @param {Object} res - Express response object
 * @returns {Object} Wishlist array or error message
 */
const viewWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'title description');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving wishlist', error });
  }
};

/**
 * Adds a movie to user's wishlist if not already present
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Updated wishlist or error message
 */
const addToWishlist = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    const user = await User.findById(req.user.id);

    if (user.wishlist.includes(movieId)) {
      return res.status(400).json({ message: 'Movie is already in wishlist' });
    }

    user.wishlist.push(movieId);
    await user.save();

    // Populate the title and genre of movies in the wishlist
    const populatedUser = await User.findById(req.user.id).populate('wishlist', 'title genre');

    res.json({ message: 'Movie added to wishlist', wishlist: populatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error adding movie to wishlist', error });
  }
};

/**
 * Removes a movie from user's wishlist
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Updated wishlist or error message
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    const user = await User.findById(req.user.id);

    if (!user.wishlist.includes(movieId)) {
      return res.status(400).json({ message: 'Movie is not in wishlist' });
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== movieId);
    await user.save();

    // Populate the title and genre of movies in the wishlist
    const populatedUser = await User.findById(req.user.id).populate('wishlist', 'title genre');

    res.json({ message: 'Movie removed from wishlist', wishlist: populatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error removing movie from wishlist', error });
  }
};

module.exports = {
  viewUserProfile,
  updateUserProfile,
  deleteUserProfile,
  updateUserPreferences,
  viewUserPreferences,
  addToWishlist,
  removeFromWishlist,
  viewWishlist,
};
