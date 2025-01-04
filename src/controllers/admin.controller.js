const Movie = require('../models/movie.model'); // Adjust the path as necessary
const User = require('../models/user.model'); // Adjust the path as necessary
const Review = require('../models/review.model'); // Adjust the path as necessary

/**
 * Get site statistics including popular movies and user activity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSiteStatistics = async (req, res) => {
  try {
    // Example: Get the most popular movies based on ratings or views, populated with necessary information
    const popularMovies = await Movie.find({}, 'title averageRating').sort({ averageRating: -1 }).limit(10);

    // Example: Get user activity (e.g., total users, total reviews)
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();

    res.json({
      popularMovies,
      totalUsers,
      totalReviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving site statistics', error });
  }
};

/**
 * Get trending genres based on user activity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTrendingGenres = async (req, res) => {
  try {
    // Use MongoDB aggregation pipeline to process the data
    const genres = await Movie.aggregate([
      // $unwind: Deconstructs an array field from the input documents to output a document for each element.
      // This is used to flatten the genre array into separate documents for each genre.
      { $unwind: "$genre" },
      // $group: Groups input documents based on the value of a specified expression.
      // This groups the documents by genre and counts the occurrences of each genre.
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      // $sort: Sorts all input documents and returns them in sorted order.
      // This sorts the genres by their count in descending order to get the most popular genres first.
      { $sort: { count: -1 } },
      // $limit: Limits the number of documents passed to the next stage in the pipeline.
      // This limits the result to the top 5 trending genres.
      { $limit: 5 }
    ]);

    // Send the result back to the client
    res.json(genres);
  } catch (error) {
    // Handle any errors that occur during the operation
    res.status(500).json({ message: 'Error retrieving trending genres', error });
  }
};

/**
 * Get most searched actors based on user searches
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMostSearchedActors = async (req, res) => {
  try {
    // Use an aggregation pipeline to find the most popular actors based on the number of movies
    const mostPopularActors = await Movie.aggregate([
      // $unwind: Deconstructs the cast array to output a document for each cast member
      { $unwind: "$cast" },
      // $group: Groups the documents by actor name and counts the number of movies
      { 
        $group: { 
          _id: "$cast.actor.name", // Group by actor name
          movieCount: { $sum: 1 } // Count the number of movies for each actor
        } 
      },
      // $sort: Sorts the actors by the number of movies in descending order
      { $sort: { movieCount: -1 } },
      // $limit: Limits the result to the top 5 most popular actors
      { $limit: 5 }
    ]);

    res.json(mostPopularActors);
  } catch (error) {
    // Handle any errors that occur during the operation
    res.status(500).json({ message: 'Error retrieving most searched actors', error });
  }
};

/**
 * Get user engagement patterns
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserEngagementPatterns = async (req, res) => {
  try {
    // This function aggregates user data to get engagement patterns, including the number of reviews, wishlist items, discussions, and articles per user.
    // It uses MongoDB's aggregation pipeline to process the data.
    const engagementData = await User.aggregate([
      // $lookup: Performs a left outer join to an unsharded collection in the same database.
      // This stage joins the User collection with the Reviews collection based on the user ID.
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "user",
          as: "reviews"
        }
      },
      // $lookup: Performs a left outer join to an unsharded collection in the same database.
      // This stage joins the User collection with the Lists collection based on the user ID to get wishlist items.
      {
        $lookup: {
          from: "lists",
          localField: "_id",
          foreignField: "creator",
          as: "wishlist"
        }
      },
      // $lookup: Performs a left outer join to an unsharded collection in the same database.
      // This stage joins the User collection with the Discussions collection based on the user ID to get discussions.
      {
        $lookup: {
          from: "discussions",
          localField: "_id",
          foreignField: "creator",
          as: "discussions"
        }
      },
      // $lookup: Performs a left outer join to an unsharded collection in the same database.
      // This stage joins the User collection with the NewsArticle collection based on the user ID to get article count.
      {
        $lookup: {
          from: "newsarticles",
          localField: "_id",
          foreignField: "author",
          as: "articles"
        }
      },
      // $project: Passes along the documents with the specified fields to the next stage in the pipeline.
      // This stage projects the username, calculates the review count, wishlist count, discussion count, and article count for each user.
      {
        $project: {
          username: 1,
          reviewCount: { $size: "$reviews" }, // $size gives the number of elements in the reviews array
          wishlistCount: { $size: "$wishlist" }, // $size gives the number of elements in the wishlist array
          discussionCount: { $size: "$discussions" }, // $size gives the number of elements in the discussions array
          articleCount: { $size: "$articles" } // $size gives the number of elements in the articles array
        }
      },
      // $sort: Sorts all input documents and returns them in sorted order.
      // This stage sorts the users by their engagement metrics in descending order to get the most engaged users first.
      { $sort: { reviewCount: -1, wishlistCount: -1, discussionCount: -1, articleCount: -1 } }
    ]);

    // Send the engagement data back to the client
    res.json(engagementData);
  } catch (error) {
    // Handle any errors that occur during the operation
    res.status(500).json({ message: 'Error retrieving user engagement patterns', error });
  }
}; 