/**
 * Movie Database Schema Definitions
 * Defines the data structure for movies, cast members, and crew members
 * @module models/movie
 */
const mongoose = require('mongoose');

/**
 * Schema for cast members (actors) in a movie
 * Includes detailed actor information and character details
 * @typedef {Object} CastMemberSchema
 */
const castMemberSchema = new mongoose.Schema({
  actor: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    photo: String, // URL to actor's headshot/profile photo
    biography: String, // Actor's biographical information
    birthDate: Date,
    birthPlace: String,
    awards: [{
      name: String, // Name of the award (e.g. "Academy Award")
      year: Number, // Year award was received
      category: String // Award category (e.g. "Best Actor")
    }],
    filmography: [{
      title: String, // Movie title
      year: Number, // Release year
      role: String // Role played in the movie
    }]
  },
  character: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String, // Character background/description
    isMainCharacter: {
      type: Boolean,
      default: false // Indicates if this is a lead role
    }
  },
  order: {
    type: Number,  // For ordering in credits (e.g. billing order)
    default: 0
  }
});

/**
 * Schema for crew members (directors, producers, etc.)
 * Includes comprehensive details about film crew members
 * @typedef {Object} CrewMemberSchema  
 */
const crewMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['director', 'producer', 'writer', 'cinematographer', 'composer', 'editor', 'production_designer', 'costume_designer']
  },
  department: {
    type: String,
    required: true,
    enum: ['directing', 'production', 'writing', 'camera', 'sound', 'editing', 'art', 'costume']
  },
  photo: String, // URL to crew member's photo
  biography: String,
  birthDate: Date,
  birthPlace: String,
  awards: [{
    name: String,
    year: Number,
    category: String
  }],
  filmography: [{
    title: String,
    year: Number,
    role: String
  }]
});

/**
 * Main movie schema containing all movie-related information
 * Includes basic details, cast & crew, technical specs, and business data
 * @typedef {Object} MovieSchema
 */
const movieSchema = new mongoose.Schema({
  // Basic movie information
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalTitle: {
    type: String,
    trim: true // For foreign films, original language title
  },
  genre: [{
    type: String,
    required: true,
    enum: ['action', 'comedy', 'drama', 'horror', 'romance', 'sci-fi', 'thriller', 'documentary', 'animation', 'adventure', 'fantasy', 'crime', 'mystery']
  }],
  cast: [castMemberSchema], // Array of cast members
  crew: [crewMemberSchema], // Array of crew members
  releaseDate: {
    type: Date,
    required: true
  },
  runtime: {
    type: Number, // Duration in minutes
    required: true,
    min: 1
  },
  synopsis: {
    type: String,
    required: true // Plot summary
  },
  tagline: String, // Movie's marketing tagline

  // Content rating information
  ageRating: {
    rating: {
      type: String,
      required: true,
      enum: ['G', 'PG', 'PG-13', 'R', 'NC-17']
    },
    reason: String, // Explanation for rating
    parentalGuidance: {
      violence: {
        level: { type: Number, min: 0, max: 5 },
        description: String
      },
      language: {
        level: { type: Number, min: 0, max: 5 },
        description: String
      },
      nudity: {
        level: { type: Number, min: 0, max: 5 },
        description: String
      },
      substances: {
        level: { type: Number, min: 0, max: 5 },
        description: String
      }
    }
  },

  // Media assets
  media: {
    coverPhoto: String, // Main promotional image URL
    photos: [String], // Array of production still URLs
    posters: [String], // Array of poster image URLs
    trailer: String // Trailer video URL
  },

  // Additional content
  trivia: [{
    fact: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  goofs: [{
    description: String,
    category: {
      type: String,
      enum: ['continuity', 'factual', 'revealing', 'plot', 'technical']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  soundtrack: [{
    title: String, // Song title
    artist: String,
    composer: String,
    duration: String,
    scene: String // Scene where song appears
  }],

  // Technical information
  technicalSpecs: {
    language: [String],
    aspectRatio: String,
    soundMix: [String], // e.g. Dolby Digital, DTS, etc.
    color: String // e.g. Color, Black and White
  },

  // Ratings and metrics
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },

  // Financial information
  budget: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  boxOffice: {
    domestic: {
      type: Number,
      default: 0
    },
    international: {
      type: Number,
      default: 0
    },
    worldwide: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Production details
  productionCompanies: [String],
  distributors: [String],
  filmingLocations: [{
    location: String,
    description: String
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Text index configuration for full-text search functionality
 * Enables searching by title, synopsis, and crew names
 */
movieSchema.index({ 
  title: 'text', 
  synopsis: 'text',
  'crew.name': 'text'
});

/**
 * Pre-save middleware to update the updatedAt timestamp
 * Automatically called before each document save
 */
movieSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export the Movie model
module.exports = mongoose.model('Movie', movieSchema);