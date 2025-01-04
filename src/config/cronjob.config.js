// config/cronJob.js
const cron = require('node-cron');
const transporter = require('./email.config');
const Reminder = require('../models/reminder.model');
const Movie = require('../models/movie.model');
const User = require('../models/user.model');

// Schedule cron job to run every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  try {
    const today = new Date();

    // Find reminders due today and not yet notified
    const reminders = await Reminder.find({
      reminderDate: { $lte: today },
      notified: false
    }).populate('userId').populate('movieId');

    reminders.forEach(async (reminder) => {
      const user = reminder.userId;
      const movie = reminder.movieId;

      // Send email notification
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Reminder: "${movie.title}" is releasing soon!`,
        text: `Hi ${user.name},\n\nThis is a reminder that the movie "${movie.title}" is releasing on ${movie.releaseDate}. Don't miss it!\n\nBest regards,\nMovie App Team`
      };

      await transporter.sendMail(mailOptions);

      // Update reminder to notified
      reminder.notified = true;
      await reminder.save();
    });

    // New feature: Notify users about upcoming movies in their favorite genres
    const users = await User.find(); // Fetch all users
    for (const user of users) {
      const favoriteGenres = user.preferences.favoriteGenres;
      const upcomingMovies = await Movie.find({
        genre: { $in: favoriteGenres },
        releaseDate: { $gte: today }
      });

      if (upcomingMovies.length > 0) {
        const movieTitles = upcomingMovies.map(movie => movie.title).join(', ');
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Upcoming Movies in Your Favorite Genres!',
          text: `Hi ${user.name},\n\nHere are some upcoming movies in your favorite genres: ${movieTitles}.\n\nBest regards,\nMovie App Team`
        };

        await transporter.sendMail(mailOptions);
      }
    }

    console.log('Reminders checked and notifications sent.');
  } catch (error) {
    console.error('Error sending reminder emails:', error);
  }
});
