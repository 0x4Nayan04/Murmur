# Murmur - Connect Through Conversation

A sophisticated real-time messaging platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.IO for seamless communication.

![Murmur App Banner](https://i.imgur.com/placeholder-image.jpg)

## ✨ Key Features

- **Instant Messaging** powered by Socket.IO
- **Secure Authentication** with JWT protection
- **Fully Responsive Design** across all devices
- **Live Presence Indicators**
- **Rich Media Sharing** capabilities
- **Customizable Profiles**
- **Personalized Themes** with 32+ options
- **Complete Message Archives**
- **Profile Picture Management** via Cloudinary

## 🚀 Technology Suite

- **Frontend**:

  - React.js with hooks
  - Zustand for state management
  - TailwindCSS with DaisyUI components
  - React Router DOM for routing
  - Axios for HTTP requests
  - Socket.IO client for real-time communication
  - React Hot Toast for notifications

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT for authentication
  - Socket.IO for real-time communication
  - Cloudinary for image storage
  - bcrypt.js for password hashing

## 📦 Installation & Configuration

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB database
- Cloudinary account for image storage

### Environment Variables

Create a `.env` file in the backend directory with:

```
MONGO_URI=<your_mongo_db_uri>
JWT_SECRET=<your_jwt_secret>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-username/murmur.git
   cd murmur
   ```

2. Install dependencies for both frontend and backend:

   ```sh
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

3. Start the development server:
   ```sh
   cd backend
   npm run dev
   cd ../frontend
   npm start
   ```

### Getting Started

1. Open your browser and navigate to `http://localhost:3000`.
2. Create a new account or sign in with existing credentials.
3. Begin connecting with others through real-time conversations!

## 📂 Project Structure

```
murmur/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── package.json
```

## 📋 API Reference

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Access existing account

### Messages

- `GET /api/messages` - Retrieve conversation history
- `POST /api/messages` - Deliver new message

### Users

- `GET /api/users` - List available contacts
- `GET /api/users/:id` - Access specific user profile

## 🤝 How to Contribute

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add exciting new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request with detailed description.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For questions or support, please contact [your-email@example.com](mailto:your-email@example.com).
