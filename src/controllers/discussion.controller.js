const Discussion = require('../models/discussion.model');

/**
 * Create a new discussion thread for a movie
 * @param {Object} req - Express request object
 * @param {Object} req.body - Discussion details including title, content, movieId
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Created discussion object
 */
exports.createDiscussion = async (req, res) => {
  try {
    // Create a new Discussion document using the request body data
    // The spread operator (...) copies all properties from req.body
    // We also add the authenticated user's ID as the creator
    // We also add the movie ID from the request parameters
    const discussion = new Discussion({
      ...req.body,
      creator: req.user._id,
      movie: req.params.movieId       
    });

    // Save the new discussion to the database
    // This will validate the data against the schema before saving
    await discussion.save();

    // Return the created discussion with 201 Created status
    // The discussion object includes the generated _id and default values
    res.status(201).json(discussion);

  } catch (error) {
    // If validation fails or there's a database error,
    // return 400 Bad Request with the error message
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get all discussions for a specific movie
 * @param {Object} req - Express request object
 * @param {string} req.params.movieId - ID of movie to get discussions for
 * @param {Object} req.query - Query parameters for pagination and sorting
 * @param {Object} res - Express response object
 * @returns {Object} Paginated discussions with total pages and current page
 */
exports.getMovieDiscussions = async (req, res) => {
  try {
    // Extract pagination parameters from query, defaulting to page 1 and 10 items per page
    const { page = 1, limit = 10 } = req.query;
    // Get the movie ID from the URL parameters
    const movieId = req.params.movieId;

    // Find all discussions for the specified movie
    // Populate creator and comment user fields to get usernames
    // Sort by creation date descending (newest first)
    // Apply pagination using limit and skip
    const discussions = await Discussion.find({ movie: movieId })
      .populate('creator', 'username') // Get creator's username
      .populate('comments.user', 'username') // Get username for each comment author
      .populate('movie', 'title genre director releaseDate') // Populate movie title and important details
      .sort({ createdAt: -1 }) // Sort newest to oldest
      .limit(limit * 1) // Convert limit to number and restrict results
      .skip((page - 1) * limit); // Skip previous pages

    // Get total count of discussions for this movie
    // Used to calculate total pages for pagination
    const count = await Discussion.countDocuments({ movie: movieId });

    // Return paginated results with metadata
    res.json({
      discussions, // Array of discussion documents
      totalPages: Math.ceil(count / limit), // Calculate total pages
      currentPage: page // Current page number
    });
  } catch (error) {
    // If any error occurs, return 500 Internal Server Error
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add a comment to an existing discussion thread
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Discussion ID to add comment to
 * @param {Object} req.body - Comment details including content
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated discussion object with added comment
 */
exports.addComment = async (req, res) => {
  try {
    // Find the discussion document by ID
    const discussion = await Discussion.findById(req.params.id);
    
    // Return 404 if discussion doesn't exist
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Add the new comment to the discussion's comments array
    // Include the authenticated user's ID and comment content
    discussion.comments.push({
      user: req.user._id,
      content: req.body.content
    });

    // Save the updated discussion document with new comment
    await discussion.save();
    
    // Fetch the updated discussion and populate user details
    // This gets usernames for both the discussion creator and comment authors
    const updatedDiscussion = await Discussion.findById(req.params.id)
      .populate('creator', 'username')
      .populate('comments.user', 'username');

    // Return the fully populated discussion document
    res.json(updatedDiscussion);
  } catch (error) {
    // Return validation or database errors with 400 status
    res.status(400).json({ message: error.message });
  }
};