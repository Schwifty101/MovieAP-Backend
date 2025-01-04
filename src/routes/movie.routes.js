const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');


//	Search, Filter, and Advanced Filtering

// Route for basic search by title, genre, director, or actors
router.get('/search', movieController.searchMovies);

// Route for filtering by ratings, popularity, release year
router.get('/filter', movieController.filterMovies);

// Route for advanced filtering (release decade, country, language, keywords)
router.get('/advanced-filter', movieController.advancedFilterMovies);

// Route for top movies of the month
router.get('/top-movies/month', movieController.getTopMoviesOfTheMonth);

// Route for top 10 movies by genre
router.get('/top-movies/genre', movieController.getTopMoviesByGenre);


router.get('/upcoming', movieController.getUpcomingMovies);    // Get upcoming releases
router.post('/upcoming/reminder',authenticate, movieController.setReminder); // Set reminder for upcoming releases


// Public routes (no authentication required)
router.get('/', movieController.getMovies);                    // Get all movies with filters

router.get('/:id', movieController.getMovieById);             // Get single movie details

// Protected routes (require user authentication)
// router.get('/recommendations', authenticate, movieController.getRecommendations);

// Movie management routes (admin only)
router.post('/', authenticate, isAdmin, movieController.createMovie);
router.put('/:id', authenticate, isAdmin, movieController.updateMovie);
router.delete('/:id', authenticate, isAdmin, movieController.deleteMovie);
router.get('/stats', authenticate, isAdmin, movieController.getMovieStats);

// Cast routes
router.get('/:movieId/cast', movieController.getMovieCast);
router.get('/:movieId/cast/:castId', movieController.getCastMember);
router.post('/:movieId/cast', authenticate, isAdmin, movieController.addCastMember);
router.put('/:movieId/cast/:castId', authenticate, isAdmin, movieController.updateCastMember);
router.delete('/:movieId/cast/:castId', authenticate, isAdmin, movieController.deleteCastMember);

// Crew routes
router.get('/:movieId/crew', movieController.getMovieCrew);
router.get('/:movieId/crew/:crewId', movieController.getCrewMember);
router.post('/:movieId/crew', authenticate, isAdmin, movieController.addCrewMember);
router.put('/:movieId/crew/:crewId', authenticate, isAdmin, movieController.updateCrewMember);
router.delete('/:movieId/crew/:crewId', authenticate, isAdmin, movieController.deleteCrewMember);

// Trivia routes
router.get('/:movieId/trivia', movieController.getMovieTrivia);
router.post('/:movieId/trivia', authenticate, movieController.addTrivia);
router.put('/:movieId/trivia/:triviaId', authenticate, isAdmin, movieController.updateTrivia);
router.delete('/:movieId/trivia/:triviaId', authenticate, isAdmin, movieController.deleteTrivia);

// Goofs routes
router.get('/:movieId/goofs', movieController.getMovieGoofs);
router.post('/:movieId/goofs', authenticate, movieController.addGoof);
router.put('/:movieId/goofs/:goofId', authenticate, isAdmin, movieController.updateGoof);
router.delete('/:movieId/goofs/:goofId', authenticate, isAdmin, movieController.deleteGoof);

// Soundtrack routes
router.get('/:movieId/soundtrack', movieController.getMovieSoundtrack);
router.post('/:movieId/soundtrack', authenticate, isAdmin, movieController.addSoundtrack);
router.put('/:movieId/soundtrack/:trackId', authenticate, isAdmin, movieController.updateSoundtrack);
router.delete('/:movieId/soundtrack/:trackId', authenticate, isAdmin, movieController.deleteSoundtrack);

// Technical specs routes
router.get('/:movieId/specs', movieController.getMovieSpecs);
router.put('/:movieId/specs', authenticate, isAdmin, movieController.updateMovieSpecs);




// Filming locations routes
router.get('/:movieId/locations', movieController.getFilmingLocations);
router.post('/:movieId/locations', authenticate, isAdmin, movieController.addFilmingLocation);
router.put('/:movieId/locations/:locationId', authenticate, isAdmin, movieController.updateFilmingLocation);
router.delete('/:movieId/locations/:locationId', authenticate, isAdmin, movieController.deleteFilmingLocation);


// Box office and budget routes
router.get('/:movieId/financials', movieController.getMovieFinancials);
router.put('/:movieId/financials', authenticate, isAdmin, movieController.updateMovieFinancials);

// Production details routes
router.get('/:movieId/production', movieController.getProductionDetails);
router.put('/:movieId/production', authenticate, isAdmin, movieController.updateProductionDetails);

// Get awards of cast and crew members
router.get('/:movieId/awards', movieController.getAwards);

module.exports = router;