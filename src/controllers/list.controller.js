const List = require('../models/list.model');

/**
 * Create a new movie list
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing list details (name, description, movies, isPublic)
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Created list object
 */
exports.createList = async (req, res) => {
  try {
    const list = new List({
      ...req.body,
      creator: req.user._id
    });
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get all accessible movie lists (public lists and user's private lists)
 * Implements pagination and populates creator information
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Number of lists per page
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Paginated lists with total pages and current page
 */
exports.getLists = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = {
      $or: [
        { creator: req.user._id },
        { isPublic: true }
      ]
    };

    const lists = await List.find(query)
      .populate('creator', 'username')
      .populate('movies', 'title')
      .populate('followers', 'username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await List.countDocuments(query);

    res.json({
      lists,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update an existing movie list
 * Only the list creator can perform updates
 * @param {Object} req - Express request object
 * @param {string} req.params.id - List ID to update
 * @param {Object} req.body - Updated list data
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated list object
 */
exports.updateList = async (req, res) => {
  try {
    // Attempt to find and update the list document in one operation
    // Only updates if the list ID matches AND the authenticated user is the creator
    // The spread operator copies all properties from req.body into the update
    // updatedAt is set to current timestamp to track modification time
    // {new: true} returns the modified document rather than the original
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    // If no list was found matching both ID and creator, return 404
    // This handles both cases where the list doesn't exist or user isn't authorized
    if (!list) {
      return res.status(404).json({ message: 'List not found or unauthorized' });
    }

    // Return the updated list document
    res.json(list);
  } catch (error) {
    // Return validation or database errors with 400 status
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete an existing movie list
 * Only the list creator can delete their lists
 * @param {Object} req - Express request object
 * @param {string} req.params.id - List ID to delete
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
exports.deleteList = async (req, res) => {
  try {
    const list = await List.findOneAndDelete({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!list) {
      return res.status(404).json({ message: 'List not found or unauthorized' });
    }

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Follow or unfollow a public movie list
 * Users can only follow public lists
 * If user already follows the list, they will unfollow it
 * @param {Object} req - Express request object
 * @param {string} req.params.id - List ID to follow/unfollow
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated list object with modified followers array
 */
exports.followList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id).populate('movies', 'title cast.actor.name');
    
    if (!list || (!list.isPublic && list.creator.toString() !== req.user._id.toString())) {
      return res.status(404).json({ message: 'List not found' });
    }

    if (list.followers.includes(req.user._id)) {
      list.followers.pull(req.user._id);
    } else {
      list.followers.push(req.user._id);
    }

    await list.save();
    res.json(await list.populate('followers', 'username email'));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Add a movie to a specific list
 * Only the list creator can add movies
 * @param {Object} req - Express request object
 * @param {string} req.params.id - List ID to add a movie to
 * @param {Object} req.body - Movie details to add (e.g., movieId)
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated list object
 */
exports.addMovieToList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id).populate('movies', 'title cast.actor.name');
    
    if (!list || list.creator.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'List not found or unauthorized' });
    }

    if (list.movies.some(movie => movie._id.toString() === req.params.movieId)) {
      return res.status(400).json({ message: 'Movie already in the list' });
    }

    list.movies.push(req.params.movieId);
    await list.save();
    res.status(201).json({ message: 'Movie added to list successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Remove a movie from a specific list
 * Only the list creator can remove movies
 * @param {Object} req - Express request object
 * @param {string} req.params.id - List ID to remove a movie from
 * @param {string} req.params.movieId - Movie ID to remove
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated list object
 */
/**
 * Remove a movie from a specific list
 * Only the list creator can remove movies
 * @param {Object} req - Express request object
 * @param {string} req.params.id - List ID to remove a movie from
 * @param {string} req.params.movieId - Movie ID to remove
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated list object
 */
exports.removeMovieFromList = async (req, res) => {
  try {
    // Find the list by ID and populate the movies
    const list = await List.findById(req.params.id).populate('movies', 'title cast.actor.name');
    
    // If the list doesn't exist or the user is not the creator, return 404
    if (!list || list.creator.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'List not found or unauthorized' });
    }

    // If the movie is not in the list, return 400
    if (!list.movies.some(movie => movie._id.toString() === req.params.movieId)) {
      return res.status(400).json({ message: 'Movie not in the list' });
    }

    // Remove the movie from the list and save the changes
    list.movies = list.movies.filter(movie => movie._id.toString() !== req.params.movieId);
    await list.save();

    // Return a success message
    res.status(200).json({ message: 'Movie removed from list successfully' });
  } catch (error) {
    // Return any errors with a 500 status
    res.status(500).json({ message: error.message });
  }
};