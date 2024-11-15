const Movie = require('../models/movie.model');

exports.createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: { movie }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate('director', 'name')
      .populate('cast.actor', 'name photo');

    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { movie }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { movie }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const movies = await Movie.find()
      .populate('director', 'name')
      .skip(skip)
      .limit(limit)
      .sort('-releaseDate');

    const total = await Movie.countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        movies,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};