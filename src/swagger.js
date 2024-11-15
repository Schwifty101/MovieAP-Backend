const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie Database API',
      version: '1.0.0',
      description: 'A comprehensive API for movie management, reviews, recommendations, and more'
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API Version 1'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'johndoe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user'
            },
            preferences: {
              type: 'object',
              properties: {
                favoriteGenres: {
                  type: 'array',
                  items: { type: 'string' }
                },
                favoriteActors: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            wishlist: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Movie'
              },
              description: "List of movies added to the user's wishlist"
            }    
          }
        },
        Movie: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: "Unique identifier for the movie",
            },
            title: {
              type: 'string',
              description: "Title of the movie",
            },
            releaseDate: {
              type: 'string',
              format: 'date',
              description: "Release date of the movie",
            },
            director: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
              },
              description: "Director of the movie",
            },
            cast: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  actor: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      name: { type: 'string' },
                      photo: { type: 'string' },
                    },
                  },
                  role: { type: 'string' },
                },
              },
              description: "Cast of the movie",
            },
            genre: {
              type: 'array',
              items: { type: 'string' },
              description: "Genres of the movie",
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            director: {
              type: 'string',
              description: "ID of the director",
            },
            averageRating: {
              type: 'number',
              format: 'float',
              description: "Average rating of the movie",
            },
            totalRatings: {
              type: 'integer',
              description: "Total number of ratings for the movie",
            },
          },
        },
        responses: {
          UnauthorizedError: {
            description: "Unauthorized access",
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: "fail",
                    },
                    message: {
                      type: 'string',
                      example: "Unauthorized",
                    },
                  },
                },
              },
            },
          },
        },
        Review: {
          type: 'object',
          required: ['movieId', 'rating', 'review'],
          properties: {
            movieId: {
              type: 'string',
              format: 'uuid'
            },
            rating: {
              type: 'number',
              minimum: 1,
              maximum: 5
            },
            review: {
              type: 'string',
              minLength: 10
            }
          }
        },
        List: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: "Unique identifier for the list",
            },
            name: {
              type: 'string',
              description: "Name of the list",
            },
            description: {
              type: 'string',
              description: "Description of the list",
            },
            creator: {
              type: 'string',
              description: "ID of the user who created the list",
            },
            movies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  title: { type: 'string' },
                  coverImage: { type: 'string' },
                },
              },
              description: "Movies included in the list",
            },
            isPublic: {
              type: 'boolean',
              description: "Whether the list is public or private",
            },
            followers: {
              type: 'array',
              items: { type: 'string' },
              description: "Array of user IDs who follow the list",
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Genre: {
          type: 'object',
          properties: {
            genre: {
              type: 'string',
            },
            count: {
              type: 'integer',
            },
          },
        },
        Analytics: {
          type: 'object',
          properties: {
            totalUsers: {
              type: 'integer',
            },
            newUsers: {
              type: 'integer',
            },
            totalReviews: {
              type: 'integer',
            },
            newReviews: {
              type: 'integer',
            },
            popularGenres: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Genre',
              },
            },
          },
        },
        Discussion: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: "Unique identifier for the discussion",
            },
            title: {
              type: 'string',
              description: "Title of the discussion",
            },
            content: {
              type: 'string',
              description: "Content of the discussion",
            },
            author: {
              type: 'string',
              description: "ID of the user who created the discussion",
            },
            category: {
              type: 'string',
              description: "Category of the discussion",
            },
            relatedMovie: {
              type: 'string',
              description: "ID of a related movie, if applicable",
            },
            relatedPerson: {
              type: 'string',
              description: "ID of a related person, if applicable",
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: "Tags associated with the discussion",
            },
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  author: { type: 'string' },
                  content: { type: 'string' },
                  createdAt: { type: 'string', format: "date-time" },
                },
              },
              description: "Comments on the discussion",
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        BoxOffice: {
          type: 'object',
          properties: {
            movie: {
              type: 'string',
              description: "The ID of the movie associated with this box office data",
            },
            gross: {
              type: 'number',
              description: "Total gross earnings of the movie",
            },
            openingWeekend: {
              type: 'number',
              description: "Opening weekend earnings of the movie",
            },
            screens: {
              type: 'integer',
              description: "Number of screens the movie was shown on",
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: "Timestamp of when the record was created",
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: "Timestamp of the last update to the record",
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);