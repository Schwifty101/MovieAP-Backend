const BoxOffice = require('../models/boxOffice.model');
const Movie = require('../models/movie.model');

exports.addBoxOfficeData = async (req, res) => {
  try {
    const { movieId } = req.params;
    const boxOfficeData = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const boxOffice = await BoxOffice.create({
      movie: movieId,
      ...boxOfficeData
    });

    res.status(201).json({
      status: 'success',
      data: { boxOffice }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getMovieBoxOffice = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const boxOffice = await BoxOffice.findOne({ movie: movieId });
    if (!boxOffice) {
      return res.status(404).json({ message: 'Box office data not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { boxOffice }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};