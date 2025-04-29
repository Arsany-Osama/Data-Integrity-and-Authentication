# Task 1 - Two-Factor Authentication (2FA) with JWT

This project is a simple Node.js API that implements user authentication with password-based login and Two-Factor Authentication (2FA) using Google Authenticator. It also includes JWT-based authorization for accessing protected routes.

## Features
- User registration with bcrypt password hashing
- Two-Factor Authentication (2FA) using Google Authenticator
- JWT token generation for authenticated users
- Secure product management (CRUD operations) with JWT authentication

## Technologies Used
- Node.js
- Express.js
- Sequelize (PostgreSQL)
- JWT (JSON Web Token)
- Speakeasy (2FA)
- QRCode (for QR code generation)
- bcrypt.js (password hashing)
- dotenv (environment variables management)

## Usage Examples

- Register user
  
  ![1](https://github.com/user-attachments/assets/94685a2e-9696-4830-acc3-0f826e999ae9)

- postgreSQL database
  ![2](https://github.com/user-attachments/assets/7c94c815-7523-4b57-847a-ea58ed75c163)

- Generating QR Code to this user in Base64
  ![3](https://github.com/user-attachments/assets/3ee97eff-3d79-4078-93dd-d32927768943)

- Convert Base64 to image (to scan it by google authenticator)
  ![4](https://github.com/user-attachments/assets/5061f07f-9353-4585-8654-261a40ec8322)

- Login by the 6-digit number token from google authenticator to get JWT token
  ![5](https://github.com/user-attachments/assets/dafe894a-f456-407f-b507-9d823e043aeb)

- Send JWT by header to allow user add product
  ![6](https://github.com/user-attachments/assets/02817588-1595-448a-8600-f4a57a011b10)

- Adding product details in JSON format then POST it
  ![7](https://github.com/user-attachments/assets/0db84dfb-eb25-4ce8-af6d-0de74a550f20)
