const Movie = require('../models/movie.model');
const Review = require('../models/review.model');
const transporter = require('../config/email.config');

const Reminder = require('../models/reminder.model');
const User = require('../models/user.model');

/**
 * Retrieves a paginated, filtered and sorted list of movies
 * Supports filtering by genre, search text, rating range and date range
 * Supports sorting by any field in ascending or descending order
 * Returns paginated results with pagination metadata
 *
 * @param {Object} req - Express request object containing query parameters:
 *   @param {number} [req.query.page=1] - Page number for pagination
 *   @param {number} [req.query.limit=10] - Number of movies per page
 *   @param {string} [req.query.genre] - Genre to filter by
 *   @param {string} [req.query.search] - Text search query
 *   @param {number} [req.query.minRating] - Minimum average rating filter
 *   @param {number} [req.query.maxRating] - Maximum average rating filter
 *   @param {string} [req.query.startDate] - Start date for release date range filter
 *   @param {string} [req.query.endDate] - End date for release date range filter
 *   @param {string} [req.query.sortBy=releaseDate] - Field to sort results by
 *   @param {string} [req.query.order=desc] - Sort order ('asc' or 'desc')
 * @param {Object} res - Express response object
 * @returns {Object} Paginated movies with metadata or error with 500 status
 */
exports.getMovies = async (req, res) => {
  try {
    // Extract and set default values for query parameters
    const { 
      page = 1, 
      limit = 10, 
      genre, 
      search,
      minRating,
      maxRating,
      startDate,
      endDate,
      sortBy = 'releaseDate',
      order = 'desc'
    } = req.query;

    // Build MongoDB query object based on provided filters
    const query = {};

    // Add genre filter if provided
    if (genre) query.genre = genre;
    
    // Add text search if search query provided
    if (search) query.$text = { $search: search };
    
    // Add rating range filter if min or max rating provided
    if (minRating || maxRating) {
      query.averageRating = {};
      if (minRating) query.averageRating.$gte = Number(minRating);
      if (maxRating) query.averageRating.$lte = Number(maxRating);
    }
    
    // Add release date range filter if start or end date provided
    if (startDate || endDate) {
      query.releaseDate = {};
      if (startDate) query.releaseDate.$gte = new Date(startDate);
      if (endDate) query.releaseDate.$lte = new Date(endDate);
    }

    // Build sort options object
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    // Execute query with pagination and sorting
    const movies = await Movie.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count of matching documents for pagination metadata
    const count = await Movie.countDocuments(query);

    // Return paginated results with metadata
    res.json({
      movies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalMovies: count
    });
  } catch (error) {
    // Return 500 Internal Server Error for any unhandled errors
    res.status(500).json({ message: error.message });
  }
};



/**
 * Retrieve detailed information for a specific movie by ID
 * 
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Movie document if found, 404 if not found
 * 
 * @throws {Error} 500 on database errors
 */
exports.getMovieById = async (req, res) => {
  try {
    // Find movie document by ID from URL parameter
    const movie = await Movie.findById(req.params.id);

    // Return 404 if movie not found
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Return movie document
    res.json(movie);
  } catch (error) {
    // Return 500 Internal Server Error on database errors
    res.status(500).json({ message: error.message });
  }
};


/**
 * Retrieve a paginated list of upcoming movies with release dates in the future
 * 
 * @param {Object} req - Express request object containing:
 *   - query.page: Page number for pagination (default: 1)
 *   - query.limit: Number of movies per page (default: 10)
 * @param {Object} res - Express response object
 * @returns {Object} JSON containing:
 *   - movies: Array of upcoming movie documents
 *   - totalPages: Total number of pages based on limit
 *   - currentPage: Current page number
 * 
 * @throws {Error} 500 if database error occurs
 */
exports.getUpcomingMovies = async (req, res) => {
  try {
    // Extract pagination parameters from query with defaults
    const { page = 1, limit = 10 } = req.query;
    const today = new Date();
    
    // Find movies with release dates in the future
    const movies = await Movie.find({
      releaseDate: { $gt: today }
    })
    .sort({ releaseDate: 1 }) // Sort by release date ascending
    .limit(limit * 1)         // Convert limit to number and apply
    .skip((page - 1) * limit); // Calculate skip for pagination

    // Get total count of upcoming movies for pagination
    const count = await Movie.countDocuments({
      releaseDate: { $gt: today }
    });

    // Return paginated results with metadata
    res.json({
      movies: movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        releaseDate: movie.releaseDate
      })),
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    // Return 500 Internal Server Error on database errors
    res.status(500).json({ message: error.message });
  }
};


/**
 * Creates a new movie document in the database with user-added trivia and goofs.
 * 
 * @param {Object} req - Express request object containing:
 *   - user.id: The ID of the authenticated user making the request
 *   - body: The movie data including trivia and goofs
 * @param {Object} res - Express response object
 * @returns {Object} JSON containing the created movie document if successful
 * 
 * @throws {Error} 400 if validation or database errors occur
 */
exports.createMovie = async (req, res) => {
  try {
    // Extract the user ID from the authenticated request to associate with trivia and goofs
    const userId = req.user.id;

    // Prepare movie data by adding the user ID to 'addedBy' fields for trivia and goofs
    const movieData = {
      ...req.body,
      releaseDate: new Date(req.body.releaseDate), // Convert releaseDate string to Date object
      // Map through trivia items to add the user ID to 'addedBy' field
      trivia: req.body.trivia ? req.body.trivia.map(triviaItem => ({
        ...triviaItem,
        addedBy: userId, // Associate the user ID with each trivia item
      })) : [],
      // Map through goof items to add the user ID to 'addedBy' field
      goofs: req.body.goofs ? req.body.goofs.map(goofItem => ({
        ...goofItem,
        addedBy: userId, // Associate the user ID with each goof item
      })) : [],
    };

    // Create a new movie instance using the prepared movie data
    const movie = new Movie(movieData);

    // Save the movie document to the database
    await movie.save();

    // Return the created movie document with a 201 Created status
    res.status(201).json(movie);
  } catch (error) {
    // Handle any validation or database errors that occur during the creation process
    res.status(400).json({ message: error.message });
  }
};




/**
 * Update an existing movie's information
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.id: MongoDB ID of movie to update
 *   - body: Updated movie data matching Movie schema
 * @param {Object} res - Express response object
 * @returns {Object} Updated movie document if successful
 * 
 * @throws {Error} 404 if movie not found
 * @throws {Error} 400 if validation fails or other client error
 */
exports.updateMovie = async (req, res) => {
  try {
    // Find and update movie document, returning the updated version
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Return 404 if movie not found
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Return updated movie document
    res.json(movie);
  } catch (error) {
    // Return 400 Bad Request for validation/client errors
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete a movie and its associated reviews from the database
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.id: MongoDB ID of movie to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message if deletion successful
 * 
 * @throws {Error} 404 if movie not found
 * @throws {Error} 500 if database error occurs
 */
exports.deleteMovie = async (req, res) => {
  try {
    // Attempt to find and delete the movie document
    const movie = await Movie.findByIdAndDelete(req.params.id);

    // Return 404 if movie not found
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Delete all reviews associated with this movie
    await Review.deleteMany({ movie: req.params.id });

    // Return success message
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    // Return 500 Internal Server Error on database errors
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get aggregated statistics about movies in the database
 * Uses MongoDB aggregation pipeline to calculate multiple statistics in parallel
 * 
 * @param {Object} req - Express request object 
 * @param {Object} res - Express response object
 * @returns {Object} JSON object containing:
 *   - genreStats: Array of objects with genre counts, sorted by frequency
 *   - ratingStats: Overall rating statistics including average rating and total ratings
 *   - yearStats: Movie counts by release year, sorted newest to oldest
 * 
 * @throws {Error} 500 if database aggregation fails
 */
exports.getMovieStats = async (req, res) => {
  try {
    const stats = await Movie.aggregate([
      {
        $facet: {
          // Get count of movies in each genre
          genreStats: [
            { $unwind: '$genre' },  // Split movies with multiple genres
            { $group: { _id: '$genre', count: { $sum: 1 } } },  // Count movies per genre
            { $sort: { count: -1 } }  // Sort by most common genres first
          ],
          // Calculate overall rating statistics
          ratingStats: [
            { 
              $group: { 
                _id: null, 
                avgRating: { $avg: '$averageRating' },  // Average rating across all movies
                totalRatings: { $sum: '$totalRatings' }  // Total number of ratings submitted
              } 
            }
          ],
          // Get movie count by release year
          yearStats: [
            {
              $group: {
                _id: { $year: '$releaseDate' },  // Extract year from release date
                count: { $sum: 1 }  // Count movies per year
              }
            },
            { $sort: { _id: -1 } }  // Sort by year descending (newest first)
          ]
        }
      }
    ]);

    res.json(stats[0]);  // Return first (and only) result from aggregation
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * Get personalized movie recommendations for the authenticated user
 * Finds highly rated movies (4+ stars) in genres the user has previously watched
 * but excludes movies they've already reviewed
 *
 * @param {Object} req - Express request object containing authenticated user
 *   - user._id: MongoDB ID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} JSON array of recommended movie documents, sorted by rating
 *   Each movie contains full movie details like title, genre, rating etc.
 * 
 * @throws {Error} 500 if database error occurs
 */
// exports.getRecommendations = async (req, res) => {
//   try {
//     const userId = req.user._id;
    
//     // Get user's watched movies and their genres by finding all their reviews
//     const userReviews = await Review.find({ user: userId }).populate('movie');
//     const userGenres = new Set();
//     userReviews.forEach(review => {
//       review.movie.genre.forEach(genre => userGenres.add(genre));
//     });

//     // Get list of movie IDs the user has already reviewed
//     const watchedMovieIds = userReviews.map(review => review.movie._id);

//     // Find top 10 highly rated movies (4+ stars) in user's preferred genres
//     // excluding movies they've already watched
//     const recommendations = await Movie.find({
//       _id: { $nin: watchedMovieIds },
//       genre: { $in: Array.from(userGenres) },
//       averageRating: { $gte: 4 }
//     })
//     .sort({ averageRating: -1 }) // Sort by rating descending
//     .limit(10);                  // Return top 10 matches

//     res.json(recommendations);
//   } catch (error) {
//     // Return 500 Internal Server Error on database errors
//     res.status(500).json({ message: error.message });
//   }
// };

/**
 * Retrieve the cast members for a specific movie by ID
 * 
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Array of cast members if found, 404 if not found
 * 
 * @throws {Error} 500 on database errors
 */
exports.getMovieCast = async (req, res) => {
  try {
    // Find movie document by ID from URL parameter
    const movie = await Movie.findById(req.params.movieId);

    // Return 404 if movie not found
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Return the cast members of the movie
    res.json(movie.cast);
  } catch (error) {
    // Return 500 Internal Server Error on database errors
    res.status(500).json({ message: error.message });
  }
};




// Cast-related controllers
exports.addCastMember = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.cast.push(req.body);
    // Sort cast by order field after adding new member
    movie.cast.sort((a, b) => a.order - b.order);
    await movie.save();

    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCastMember = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const castMember = movie.cast.id(req.params.castId);
    if (!castMember) {
      return res.status(404).json({ message: 'Cast member not found' });
    }

    Object.assign(castMember, req.body);
    await movie.save();

    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCastMember = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.cast.pull(req.params.castId);
    await movie.save();

    res.json({ message: 'Cast member removed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



exports.getCastMember = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const castMember = movie.cast.id(req.params.castId);
    if (!castMember) {
      return res.status(404).json({ message: 'Cast member not found' });
    }

    // Find other movies this actor has appeared in
    const filmography = await Movie.find({
      'cast.actor.name': castMember.actor.name
    }).select('title releaseDate cast.$');

    res.json({
      ...castMember.toObject(),
      filmography
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * Get crew member details with filmography
 */
exports.getCrewMember = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const crewMember = movie.crew.id(req.params.crewId);
    if (!crewMember) {
      return res.status(404).json({ message: 'Crew member not found' });
    }

    // Find other movies this crew member has worked on
    const filmography = await Movie.find({
      'crew.name': crewMember.name
    }).select('title releaseDate crew.$');

    res.json({
      ...crewMember.toObject(),
      filmography
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieve the crew members for a specific movie by ID
 * 
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Array of crew members if found, 404 if not found
 * 
 * @throws {Error} 500 on database errors
 */
exports.getMovieCrew = async (req, res) => {
  try {
    // Find movie document by ID from URL parameter
    const movie = await Movie.findById(req.params.movieId);

    // Return 404 if movie not found
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Return the crew members of the movie
    res.json(movie.crew);
  } catch (error) {
    // Return 500 Internal Server Error on database errors
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add crew member to a movie
 */
exports.addCrewMember = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.crew.push(req.body);
    await movie.save();

    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
/**
 * Update an existing crew member's information
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - params.crewId: MongoDB ID of the crew member to update
 *   - body: Updated crew member data matching CrewMember schema
 * @param {Object} res - Express response object
 * @returns {Object} Updated crew member document if successful
 * 
 * @throws {Error} 404 if movie or crew member not found
 * @throws {Error} 400 if validation fails or other client error
 */
exports.updateCrewMember = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const crewMember = movie.crew.id(req.params.crewId);
    if (!crewMember) {
      return res.status(404).json({ message: 'Crew member not found' });
    }

    Object.assign(crewMember, req.body); // Update crew member details
    await movie.save();

    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete a crew member from a movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - params.crewId: MongoDB ID of the crew member to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message if deletion successful
 * 
 * @throws {Error} 404 if movie or crew member not found
 * @throws {Error} 500 if database error occurs
 */
exports.deleteCrewMember = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.crew.pull(req.params.crewId); // Remove crew member by ID
    await movie.save();

    res.json({ message: 'Crew member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/**
 * Add trivia to a movie
 * Requires user authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - body.fact: The trivia fact to be added
 *   - user: The authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} The updated movie object with the new trivia fact
 * 
 * @throws {Error} 404 if movie not found
 * @throws {Error} 400 if database error occurs
 */
exports.addTrivia = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.trivia.push({
      fact: req.body.fact,
      addedBy: req.user._id
    });
    await movie.save();

    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/**
 * Retrieve the trivia for a specific movie by ID
 * 
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Array of trivia items if found, 404 if not found
 * 
 * @throws {Error} 500 on database errors
 */
exports.getMovieTrivia = async (req, res) => {
  try {
    // Find movie document by ID from URL parameter
    const movie = await Movie.findById(req.params.movieId);

    // Return 404 if movie not found
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Return the trivia of the movie
    res.json(movie.trivia);
  } catch (error) {
    // Return 500 Internal Server Error on database errors
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update an existing trivia item for a specific movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - params.triviaId: MongoDB ID of the trivia item to update
 *   - body: Updated trivia data
 * @param {Object} res - Express response object
 * @returns {Object} Updated trivia item if successful
 * 
 * @throws {Error} 404 if movie or trivia item not found
 * @throws {Error} 400 if validation fails or other client error
 */
exports.updateTrivia = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const triviaItem = movie.trivia.id(req.params.triviaId);
    if (!triviaItem) {
      return res.status(404).json({ message: 'Trivia item not found' });
    }

    Object.assign(triviaItem, req.body); // Update trivia item details
    await movie.save();

    res.json(triviaItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete a trivia item from a movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - params.triviaId: MongoDB ID of the trivia item to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message if deletion successful
 * 
 * @throws {Error} 404 if movie or trivia item not found
 * @throws {Error} 500 if database error occurs
 */
exports.deleteTrivia = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.trivia.pull(req.params.triviaId); // Remove trivia item by ID
    await movie.save();

    res.json({ message: 'Trivia item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/**
 * Add goof to a movie
 */
exports.addGoof = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.goofs.push({
      description: req.body.description,
      category: req.body.category,
      addedBy: req.user._id
    });
    await movie.save();

    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
/**
 * Retrieve the goofs for a specific movie by ID
 * 
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Array of goofs if found, 404 if not found
 * 
 * @throws {Error} 500 on database errors
 */
exports.getMovieGoofs = async (req, res) => {
  try {
    // Find movie document by ID from URL parameter
    const movie = await Movie.findById(req.params.movieId);

    // Return 404 if movie not found
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Return the goofs of the movie
    res.json(movie.goofs);
  } catch (error) {
    // Return 500 Internal Server Error on database errors
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update an existing goof for a specific movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - params.goofId: MongoDB ID of the goof to update
 *   - body: Updated goof data
 * @param {Object} res - Express response object
 * @returns {Object} Updated goof if successful
 * 
 * @throws {Error} 404 if movie or goof not found
 * @throws {Error} 400 if validation fails or other client error
 */
exports.updateGoof = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const goof = movie.goofs.id(req.params.goofId);
    if (!goof) {
      return res.status(404).json({ message: 'Goof not found' });
    }

    Object.assign(goof, req.body); // Update goof details
    await movie.save();

    res.json(goof);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete a goof from a movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - params.goofId: MongoDB ID of the goof to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message if deletion successful
 * 
 * @throws {Error} 404 if movie or goof not found
 * @throws {Error} 500 if database error occurs
 */
exports.deleteGoof = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.goofs.pull(req.params.goofId); // Remove goof by ID
    await movie.save();

    res.json({ message: 'Goof removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add soundtrack information to a movie
 */
exports.addSoundtrack = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.soundtrack.push(req.body);
    await movie.save();

    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
/**
 * Retrieve the soundtrack for a specific movie by ID
 * 
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Array of soundtrack items if found, 404 if not found
 * 
 * @throws {Error} 500 on database errors
 */
exports.getMovieSoundtrack = async (req, res) => {
  try {
    // Find movie document by ID from URL parameter
    const movie = await Movie.findById(req.params.movieId);

    // Return 404 if movie not found
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Return the soundtrack of the movie
    res.json(movie.soundtrack);
  } catch (error) {
    // Return 500 Internal Server Error on database errors
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update an existing soundtrack item for a specific movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - params.trackId: MongoDB ID of the soundtrack item to update
 *   - body: Updated soundtrack data
 * @param {Object} res - Express response object
 * @returns {Object} Updated soundtrack item if successful
 * 
 * @throws {Error} 404 if movie or soundtrack item not found
 * @throws {Error} 400 if validation fails or other client error
 */
exports.updateSoundtrack = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const track = movie.soundtrack.id(req.params.trackId);
    if (!track) {
      return res.status(404).json({ message: 'Soundtrack item not found' });
    }

    Object.assign(track, req.body); // Update soundtrack item details
    await movie.save();

    res.json(track);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete a soundtrack item from a movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - params.trackId: MongoDB ID of the soundtrack item to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message if deletion successful
 * 
 * @throws {Error} 404 if movie or soundtrack item not found
 * @throws {Error} 500 if database error occurs
 */
exports.deleteSoundtrack = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.soundtrack.pull(req.params.trackId); // Remove soundtrack item by ID
    await movie.save();

    res.json({ message: 'Soundtrack item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * Retrieve the technical specifications for a specific movie by ID
 * 
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Array of technical specifications if found, 404 if not found
 * 
 * @throws {Error} 500 on database errors
 */
exports.getMovieSpecs = async (req, res) => {
  try {
    // Find movie document by ID from URL parameter
    const movie = await Movie.findById(req.params.movieId);

    // Return 404 if movie not found
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Return the technical specifications of the movie
    res.json(movie.specs);
  } catch (error) {
    // Return 500 Internal Server Error on database errors
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update the technical specifications for a specific movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - body: Updated technical specifications data
 * @param {Object} res - Express response object
 * @returns {Object} Updated technical specifications if successful
 * 
 * @throws {Error} 404 if movie not found
 * @throws {Error} 400 if validation fails or other client error
 */
exports.updateMovieSpecs = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.specs = req.body; // Update technical specifications
    await movie.save();

    res.json(movie.specs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Retrieve the box office and budget information for a specific movie by ID
 * 
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Box office and budget information if found, 404 if not found
 * 
 * @throws {Error} 500 on database errors
 */
exports.getMovieFinancials = async (req, res) => {
  try {
    // Find movie document by ID from URL parameter
    const movie = await Movie.findById(req.params.movieId);

    // Return 404 if movie not found
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Return the box office and budget information of the movie
    res.json({
      budget: movie.budget,
      boxOffice: movie.boxOffice
    });
  } catch (error) {
    // Return 500 Internal Server Error on database errors
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update the box office and budget information for a specific movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - body: Updated box office and budget data
 * @param {Object} res - Express response object
 * @returns {Object} Updated box office and budget information if successful
 * 
 * @throws {Error} 404 if movie not found
 * @throws {Error} 400 if validation fails or other client error
 */
exports.updateMovieFinancials = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.budget = req.body.budget;
    movie.boxOffice = req.body.boxOffice;
    await movie.save();

    res.json({
      budget: movie.budget,
      boxOffice: movie.boxOffice
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Retrieve the production details for a specific movie by ID
 * 
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Production details if found, 404 if not found
 * 
 * @throws {Error} 500 on database errors
 */
exports.getProductionDetails = async (req, res) => {
  try {
    // Find movie document by ID from URL parameter
    const movie = await Movie.findById(req.params.movieId);

    // Return 404 if movie not found
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Return the production details of the movie
    res.json(movie.productionCompanies);
  } catch (error) {
    // Return 500 Internal Server Error on database errors
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update the production details for a specific movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - body: Updated production details data
 * @param {Object} res - Express response object
 * @returns {Object} Updated production details if successful
 * 
 * @throws {Error} 404 if movie not found
 * @throws {Error} 400 if validation fails or other client error
 */
exports.updateProductionDetails = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.productionCompanies = req.body; // Update production details
    await movie.save();

    res.json(movie.production);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Retrieve the filming locations for a specific movie by ID
 * 
 * @param {Object} req - Express request object containing movie ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Array of filming locations if found, 404 if not found
 * 
 * @throws {Error} 500 on database errors
 */
exports.getFilmingLocations = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie.locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add a filming location to a movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - body: Filming location data
 * @param {Object} res - Express response object
 * @returns {Object} The updated movie object with the new filming location
 * 
 * @throws {Error} 404 if movie not found
 * @throws {Error} 400 if database error occurs
 */
exports.addFilmingLocation = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.locations.push(req.body);
    await movie.save();

    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Update an existing filming location for a specific movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - params.locationId: MongoDB ID of the filming location to update
 *   - body: Updated filming location data
 * @param {Object} res - Express response object
 * @returns {Object} Updated filming location if successful
 * 
 * @throws {Error} 404 if movie or location not found
 * @throws {Error} 400 if validation fails or other client error
 */
exports.updateFilmingLocation = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const location = movie.locations.id(req.params.locationId);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    Object.assign(location, req.body);
    await movie.save();

    res.json(location);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete a filming location from a movie
 * Requires admin authentication
 * 
 * @param {Object} req - Express request object containing:
 *   - params.movieId: MongoDB ID of the movie
 *   - params.locationId: MongoDB ID of the filming location to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message if deletion successful
 * 
 * @throws {Error} 404 if movie or location not found
 * @throws {Error} 500 if database error occurs
 */
exports.deleteFilmingLocation = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.locations.pull(req.params.locationId);
    await movie.save();

    res.json({ message: 'Location removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//	Search, Filter, and Advanced Filtering---------------------------------------

// Basic search by title, genre, director, or actors
exports.searchMovies = async (req, res) => {
  try {
    const { title, genre, director, actor } = req.query;
    const searchQuery = {};

        if (title) searchQuery.title = new RegExp(title, 'i');
        if (genre) searchQuery.genre = genre;
        if (director) searchQuery.director = new RegExp(director, 'i');
        if (actor) searchQuery.actors = new RegExp(actor, 'i');

        const movies = await Movie.find(searchQuery);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Filter by ratings, popularity, release year
exports.filterMovies = async (req, res) => {
  try {
    const { rating, popularity, releaseYear } = req.query;
    const query = {};

    if (rating) {
      query.averageRating = { $gte: rating }; // Filter by minimum rating
    }
    if (popularity) {
      query.totalRatings = { $gte: popularity }; // Filter by popularity
    }
    if (releaseYear) {
      query.releaseDate = { $gte: new Date(releaseYear, 0, 1), $lt: new Date(parseInt(releaseYear) + 1, 0, 0) }; // Filter by specific release year
    }

    const movies = await Movie.find(query);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Advanced filtering (release decade, country, language, keywords)
exports.advancedFilterMovies = async (req, res) => {
  try {
    const { releaseDecade, country, language, keywords } = req.query;
    const query = {};

    if (releaseDecade) {
      const startYear = parseInt(releaseDecade, 10);
      const endYear = startYear + 9;
      query.releaseDate = { $gte: new Date(startYear, 0, 1), $lt: new Date(endYear + 1, 0, 0) };
    }
    if (country) {
      query.filmingLocations = { $elemMatch: { location: { $regex: country, $options: 'i' } } }; // Filter by country
    }
    if (language) {
      query.technicalSpecs = { $elemMatch: { language: { $in: [language] } } }; // Filter by language
    }
    if (keywords) {
      query.$or = [
        { synopsis: { $regex: keywords, $options: 'i' } },
        { tagline: { $regex: keywords, $options: 'i' } },
        { 'trivia.fact': { $regex: keywords, $options: 'i' } },
        { 'goofs.description': { $regex: keywords, $options: 'i' } }
      ]; // Filter by keywords in synopsis, tagline, trivia, and goofs
    }

    const movies = await Movie.find(query);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get top movies of the month
exports.getTopMoviesOfTheMonth = async (req, res) => {
  try {
    const topMovies = await Movie.find()
      .sort({ releaseDate: -1 }) // Sort by release date (most recent first)
      .limit(10); // Limit to top 10 movies

    res.json(topMovies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get top 10 movies by genre
exports.getTopMoviesByGenre = async (req, res) => {
  try {
    const { genre } = req.query; // Get genre from query parameters

    if (!genre) {
      return res.status(400).json({ message: 'Genre is required' });
    }

    const topMovies = await Movie.find({ genre: { $in: genre.split(',') } }) // Filter by genre
      .sort({ averageRating: -1 }) // Sort by average rating
      .limit(10); // Limit to top 10 movies

    res.json(topMovies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setReminder = async (req, res) => {
  const userId = req.user.id; // Assuming auth middleware attaches user info to req.user
  const { movieId } = req.body;

  try {
    const movie = await Movie.findById(movieId);
    const user = await User.findById(userId);

    if (!movie || new Date(movie.releaseDate) < new Date()) {
      return res.status(404).json({ message: 'Movie not found or already released' });
    }

    // Save reminder to the database
    await Reminder.create({
      userId,
      movieId,
      reminderDate: new Date(movie.releaseDate),
      notified: false // To track if user has been notified
    });

    // Send immediate confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Reminder Set for "${movie.title}"`,
      text: `Hi ${user.username},\n\nWe're thrilled to let you know that your reminder for the movie "${movie.title}" is all set! The movie is scheduled to release on ${movie.releaseDate}. We can't wait for you to enjoy it!\n\nWarm regards,\nMovie App Team`
    };
    
    await transporter.sendMail(mailOptions);

    res.json({
      message: `Reminder set for the movie "${movie.title}" and a confirmation email has been sent!`,
      movieTitle: movie.title,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error setting reminder or sending email', error });
  }
};

// Get awards of cast and crew members
exports.getAwards = async (req, res) => {
  const { movieId } = req.params; // Movie ID from the request parameters

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const awards = {
      castAwards: movie.cast.map(castMember => ({
        actor: castMember.actor.name,
        awards: castMember.actor.awards
      })),
      crewAwards: movie.crew.map(crewMember => ({
        name: crewMember.name,
        role: crewMember.role,
        awards: crewMember.awards
      }))
    };

    res.json(awards);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve awards', error });
  }
};

