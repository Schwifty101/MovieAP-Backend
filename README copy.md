## Setup & Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required environment variables:
```
MONGODB_URI=mongodb://localhost:27017/moviedb
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

3. Start the server:
```bash
npm run dev
```

## API Testing Guide

### Authentication

#### Register a New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Movies

#### Create Movie (Admin only)
```http
POST /api/movies
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Inception",
  "genre": ["Sci-Fi", "Action"],
  "director": "Christopher Nolan",
  "cast": ["Leonardo DiCaprio", "Ellen Page"],
  "releaseDate": "2010-07-16",
  "synopsis": "A thief who steals corporate secrets through dream-sharing technology...",
  "posterUrl": "https://example.com/inception.jpg",
  "trailerUrl": "https://youtube.com/watch?v=inception"
}
```

#### Search Movies
```http
GET /api/movies?search=inception&genre=Sci-Fi&minRating=4&page=1&limit=10
```

### Reviews

#### Create Review
```http
POST /api/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "movieId": "{movie_id}",
  "rating": 5,
  "comment": "A masterpiece of modern cinema!"
}
```

### Lists

#### Create Custom List
```http
POST /api/lists
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Best Sci-Fi Movies",
  "description": "My favorite science fiction films",
  "movies": ["{movie_id1}", "{movie_id2}"],
  "isPublic": true
}
```

### Discussions

#### Start Discussion
```http
POST /api/discussions
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Plot Analysis: Inception",
  "content": "Let's discuss the ending...",
  "movie": "{movie_id}"
}
```

## Testing with Swagger

1. Access Swagger UI at: `http://localhost:3000/api-docs`
2. Use the "Authorize" button to add your JWT token
3. Test endpoints directly from the UI

## Testing with Postman

1. Import the following collection:
```json
{
  "info": {
    "name": "Movie Recommendation API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    }
  ]
}
```

2. Set environment variables:
   - `baseUrl`: `http://localhost:3000/api`
   - `token`: JWT token from login response

## Sample Test Data

### Movies
```json
{
  "title": "The Dark Knight",
  "genre": ["Action", "Crime", "Drama"],
  "director": "Christopher Nolan",
  "cast": ["Christian Bale", "Heath Ledger"],
  "releaseDate": "2008-07-18",
  "synopsis": "When the menace known as the Joker wreaks havoc...",
  "posterUrl": "https://example.com/dark-knight.jpg",
  "trailerUrl": "https://youtube.com/watch?v=dark-knight"
}
```

### Reviews
```json
{
  "rating": 5,
  "comment": "Heath Ledger's performance was outstanding!"
}
```

### Lists
```json
{
  "name": "Christopher Nolan Collection",
  "description": "Best movies by Christopher Nolan",
  "isPublic": true
}
```

## Testing Flow

1. Register a new user
2. Login and save the JWT token
3. Create some movies (as admin)
4. Add reviews to movies
5. Create custom lists
6. Start discussions
7. Test search and filtering
8. Test pagination

## Common HTTP Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security Notes

- Always use HTTPS in production
- Keep JWT tokens secure
- Never share your `.env` file
- Regularly update dependencies