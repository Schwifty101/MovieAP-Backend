const Movie = require('../models/movie.model');
const Person = require('../models/person.model');

exports.searchMovies = async (req, res) => {
  try {
    const {
      query,
      genre,
      year,
      rating,
      language,
      country,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (page - 1) * limit;
    
    const searchQuery = {};
    
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { synopsis: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (genre) searchQuery.genre = genre;
    if (year) searchQuery.releaseDate = { 
      $gte: new Date(year, 0, 1), 
      $lte: new Date(year, 11, 31) 
    };
    if (rating) searchQuery.averageRating = { $gte: parseFloat(rating) };
    if (language) searchQuery.language = language;
    if (country) searchQuery.country = country;

    const movies = await Movie.find(searchQuery)
      .populate('director', 'name')
      .skip(skip)
      .limit(limit)
      .sort('-averageRating');

    const total = await Movie.countDocuments(searchQuery);

    res.status(200).json({
      status: 'success',
      data: {
        movies,
        pagination: {
          current: parseInt(page),
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

exports.getTopMoviesByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    
    const movies = await Movie.find({ genre })
      .sort('-averageRating -totalRatings')
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: { movies }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};