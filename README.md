# API Documentation

This API provides endpoints for user registration and login, as well as access to a protected route. It uses JSON Web Tokens (JWT) for authentication.

- exmaple app
https://github.com/SkepSickomode/tgitest3app


## Getting Started

To use this API, you can make HTTP requests to the following endpoints.

### Registration

- **URL:** `/auth/register/`
- **Method:** `GET`
- **Description:** Register a new user.
- **Request Parameters:**
  - `username` (string, required): Desired username for the new account.
  - `email` (string, required): User's email address.
  - `password` (string, required): User's password.
- **Example Request:**
  ```http
  GET http://localhost:3000/auth/register/?username=johndoe&email=john@example.com&password=secure123
  ```
  - Success Response (200):
  ```json
  {
  "message": "user registered"
  }
  ```
  - Username Already Exists Response (409):
  ```json
  {
  "message": "username already registered"
  }
  ```
  - Invalid Request Response (422):
  ```json
  {
  "message": "invalid username or password"
  }
  ```

### Login

- **URL:** /auth/login/
-    **Method:** GET
-    Description:** Log in with an existing user account.
-    **Request Parameters (string, required):** Username of the registered user.
- `password` (string, required): Password associated with the username.
- **Example Request:**
  ```http
  GET http://localhost:3000/auth/login/?username=johndoe&password=secure123
  ```

- Success Response (200):
```json
{
  "token": "your-json-web-token"
}
```
- Login Failed Response (401):
```json
{
  "token": "login failed"
}
```
- Invalid Request Response (422):
```json
{
  "message": "invalid username or password"
}
```
