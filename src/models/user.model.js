const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Database Schema Definitions
 * Defines the data structure for user profiles, including authentication, role, preferences, and movie lists
 * @module models/user
 */
const userSchema = new mongoose.Schema({
  /**
   * Username field definition
   * @type {String}
   * @required {Boolean} Ensures a username is always provided
   * @unique {Boolean} Ensures each username is unique across the database
   * @trim {Boolean} Automatically removes whitespace from the start and end of the string
   * @minlength {Number} Sets the minimum length of the username to 3 characters
   */
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  /**
   * Email field definition
   * @type {String}
   * @required {Boolean} Ensures an email is always provided
   * @unique {Boolean} Ensures each email is unique across the database
   * @trim {Boolean} Automatically removes whitespace from the start and end of the string
   * @lowercase {Boolean} Converts the email to lowercase for consistency
   */
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  /**
   * Password field definition
   * @type {String}
   * @required {Boolean} Ensures a password is always provided
   * @minlength {Number} Sets the minimum length of the password to 6 characters
   */
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  /**
   * Role field definition
   * @type {String}
   * @enum {Array} Limits the role to either 'user' or 'admin'
   * @default {String} Sets the default role to 'user'
   */
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  /**
   * Preferences field definition
   * @type {Object}
   * @property {Array} favoriteGenres - Array of favorite genres
   * @property {Array} favoriteActors - Array of favorite actors
   * @property {Array} favoriteDirectors - Array of favorite directors
   * @property {Array} contentRating - Array of preferred content ratings
   * @property {Array} languages - Array of preferred languages
   */
  preferences: {
    /**
     * Favorite Genres field definition
     * @type {Array}
     * @enum {Array} Limits the genres to a predefined list
     */
    favoriteGenres: [{
      type: String,
      enum: ['action', 'comedy', 'drama', 'horror', 'romance', 'sci-fi', 'thriller', 'documentary', 'animation']
    }],
    /**
     * Favorite Actors field definition
     * @type {Array}
     * @trim {Boolean} Automatically removes whitespace from the start and end of each actor's name
     */
    favoriteActors: [{
      type: String,
      trim: true
    }],
    /**
     * Favorite Directors field definition
     * @type {Array}
     * @trim {Boolean} Automatically removes whitespace from the start and end of each director's name
     */
    favoriteDirectors: [{
      type: String,
      trim: true
    }],
    /**
     * Content Rating field definition
     * @type {Array}
     * @enum {Array} Limits the content ratings to a predefined list
     */
    contentRating: [{
      type: String,
      enum: ['G', 'PG', 'PG-13', 'R', 'NC-17']
    }],
    /**
     * Languages field definition
     * @type {Array}
     * @trim {Boolean} Automatically removes whitespace from the start and end of each language
     */
    languages: [{
      type: String,
      trim: true
    }]
  },
  /**
   * Wishlist field definition
   * @type {Array}
   * @ref {String} References the Movie model for each movie in the wishlist
   */
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  /**
   * Watched Movies field definition
   * @type {Array}
   * @ref {String} References the Movie model for each movie watched
   */
  watchedMovies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  /**
   * Created At field definition
   * @type {Date}
   * @default {Date} Sets the default value to the current date and time
   */
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Mongoose pre-save middleware for the User schema
 * This middleware automatically runs before any user document is saved to the database
 * 
 * Purpose:
 * - Handles password hashing before storing in database
 * - Only hashes the password if it has been modified (new user or password change)
 * - Uses bcrypt for secure one-way hashing with a work factor of 10
 * 
 * @param {Function} next - Mongoose middleware next() function to continue execution
 * @returns {Promise<void>} Resolves when password is hashed or if no hashing needed
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (this.isModified('password')) {
    // Generate a secure hash using bcrypt with a work factor of 10
    // Higher work factors are more secure but slower
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  // Proceed to save the document
  next();
});

/**
 * Instance method to compare a candidate password with the user's hashed password
 * @param {string} candidatePassword - The plain text password to verify
 * @returns {Promise<boolean>} Returns true if passwords match, false otherwise
 * 
 * This method uses bcrypt.compare() which:
 * 1. Takes the candidate password and hashed password stored in the database
 * 2. Hashes the candidate password with the same salt used for the stored hash
 * 3. Compares the two hashes to verify if the passwords match
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);