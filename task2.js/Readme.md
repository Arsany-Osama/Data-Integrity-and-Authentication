# Secure Authentication System with Manual and GitHub OAuth Login

A secure web application built with **Node.js** and **Express.js**, implementing both **manual login** (email/password) and **GitHub OAuth 2.0**. It uses **JWT** for session management, **bcrypt** for password hashing, and includes a responsive UI with comprehensive error handling and activity logging.

---

## Features

- **Manual Authentication**: Register and login using username, email, and password.
- **GitHub OAuth 2.0**: Login with your GitHub account.
- **Secure Password Storage**: Passwords hashed with bcrypt and strong password policy (8+ characters, uppercase, lowercase, number, special character).
- **JWT Authentication**: Secure token-based sessions.
- **Login Activity Logging**: Logs IP address, timestamp, method used, and user ID.
- **Prevent Back Navigation**: Uses `Cache-Control` headers and JWT validation.
- **Responsive UI**: Clean, client-side validation and friendly error messages.
- **Remember Me**: Optionally extend session to 7 days.
- **Error Handling**: Descriptive client and server-side error messages.

---

## Technologies Used

- **Node.js** – Backend JavaScript runtime
- **Express.js** – Web framework
- **Sequelize** – ORM for PostgreSQL
- **PostgreSQL** – Database
- **bcrypt.js** – Password hashing
- **jsonwebtoken (JWT)** – Token management
- **passport-github2** – GitHub OAuth strategy
- **express-validator** – Input validation
- **EJS** – Templating engine
- **dotenv** – Environment variables
- **CSS/JavaScript** – UI styling and logic


## UI
- **Sign Up** – With Dark Mode
  ![Screenshot (557)](https://github.com/user-attachments/assets/37875ed3-6789-4b05-acab-485e1b712e33)

- **Login** – With light Mode:
  ![Screenshot (554)](https://github.com/user-attachments/assets/c6b33bc0-5a08-49d6-850a-a11670adc70e)

- **Homepage** – With Dark Mode:
  ![Screenshot (555)](https://github.com/user-attachments/assets/49bcf03a-9be9-4735-b1bf-9108bca22dd2)

# API Endpoints
|        Endpoint       | Method |          Description         | Auth Required  | 
|:---------------------:|:------:|:----------------------------:|:---------------|
| /auth/signup          | POST   | Register manually            | ❌             |
| /auth/login           | POST   | Manual login                 | ❌             |
| /auth/github          | GET    | Initiate GitHub login        | ❌             |
| /auth/github/callback | GET    | Handle GitHub OAuth callback | ❌             |
| /auth/logout          | POST   | Logout user                  | ✅             |
| /auth/user            | GET    | Get current user info        | ✅             |
| /auth/home            | GET    | Render home page             | ✅             |

# Database Schema

## User Table
|    Column   	|    Type   	|              Description             	|
|:-----------:	|:---------:	|:------------------------------------:	|
| id          	| INTEGER   	| Primary key, auto-increment          	|
| username    	| VARCHAR   	| Unique username                      	|
| email       	| VARCHAR   	| Unique email                         	|
| password    	| VARCHAR   	| Hashed password (nullable for OAuth) 	|
| github_id   	| VARCHAR   	| GitHub user ID (nullable, unique)    	|
| auth_method 	| ENUM      	| 'manual' or 'github'                 	|
| created_at  	| TIMESTAMP 	| User creation time                   	|

## Login Logs Table
|    Column    	|    Type   	|         Description         	|
|:------------:	|:---------:	|:---------------------------:	|
| id           	| INTEGER   	| Primary key, auto-increment 	|
| user_id      	| INTEGER   	| Foreign key → Users(id)     	|
| ip_address   	| VARCHAR   	| User’s IP address           	|
| login_method 	| ENUM      	| 'manual' or 'github'        	|
| timestamp    	| TIMESTAMP 	| Login time                  	|
