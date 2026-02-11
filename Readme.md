# 💬 Murmur - Real-Time Chat Application

> A sophisticated real-time messaging platform built with the MERN stack and
> Socket.IO for seamless communication experiences.

**Live:** [murmur.nayan04.me](https://murmur.nayan04.me) | **GitHub:**
[0x4Nayan04/Murmur](https://github.com/0x4Nayan04/Murmur/tree/main)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black.svg)](https://socket.io/)

## Key Features

### Core Functionality

- **Real-time messaging** powered by Socket.IO with sub-second latency
- **Secure authentication** with JWT protection and bcrypt password hashing
- **Image sharing** with direct Cloudinary uploads (5MB limit, optimized
  compression)
- **Typing indicators** with smart 2-second timeout for enhanced UX
- **Online presence** tracking with automatic status updates
- **Message read receipts** and delivery status indicators

### User Experience

- **Optimistic UI updates** for instant feedback and perceived performance
- **Responsive design** with TailwindCSS and DaisyUI components
- **Search functionality** with debounced input for finding contacts
- **Form state management** with automatic cleanup on user switches
- **Error handling** with user-friendly toast notifications
- **Dark/Light mode** support via DaisyUI themes

### Security & Performance

- **Input validation** with comprehensive Zod schemas
- **CORS protection** with environment-based configuration
- **Production-ready** error handling and logging
- **Secure cookie** configuration for cross-origin deployment

## Technology Stack

### Frontend

- **React.js 18.3** with modern hooks and functional components
- **Zustand** for lightweight, performant state management
- **Vite** for fast development and optimized production builds
- **TailwindCSS + DaisyUI** for responsive, component-based styling
- **Socket.IO Client** for real-time bidirectional communication
- **Axios** with custom interceptors for HTTP requests
- **React Hot Toast** for elegant notification system
- **Lucide React** for consistent icon library
- **React Router DOM** for client-side routing

### Backend

- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM for data modeling
- **Socket.IO** server for real-time event handling
- **JWT** for stateless authentication
- **Zod** for runtime type validation and API security
- **Cloudinary** for optimized image storage and delivery
- **bcrypt.js** for secure password hashing
- **CORS** middleware with environment-based configuration

### Development Tools

- **ESLint** with React and Node.js configurations
- **Prettier** for consistent code formatting
- **Nodemon** for backend development hot-reloading
- **Concurrently** for running multiple development servers

## Quick Start

### Prerequisites

- **Node.js** v16+ (v18+ recommended)
- **MongoDB** database (local or cloud instance)
- **Cloudinary** account for image storage
- **Git** for version control

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/0x4Nayan04/Murmur.git
   cd Murmur
   ```

2. **Install all dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables** (see
   [Environment Configuration](#environment-configuration))

4. **Start development servers**:

   ```bash
   npm run dev
   ```

   This starts both backend (port 5001) and frontend (port 5173) concurrently.

5. **Open your browser** and navigate to `http://localhost:5173`

### Available Scripts

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start both frontend and backend in development mode |
| `npm run dev:backend`  | Start only backend server (port 5001)               |
| `npm run dev:frontend` | Start only frontend server (port 5173)              |
| `npm run build`        | Build production-ready frontend bundle              |
| `npm run start`        | Start backend in production mode                    |
| `npm run format`       | Format code with Prettier                           |
| `npm run format:check` | Check code formatting without changes               |

#### Backend Scripts

| Command                             | Description                |
| ----------------------------------- | -------------------------- |
| `npm run lint --prefix backend`     | Run ESLint on backend code |
| `npm run lint:fix --prefix backend` | Auto-fix ESLint issues     |

#### Frontend Scripts

| Command                             | Description                      |
| ----------------------------------- | -------------------------------- |
| `npm run lint --prefix frontend`    | Run ESLint on frontend code      |
| `npm run preview --prefix frontend` | Preview production build locally |

## Environment Configuration

### Backend Environment Variables

Create `.env` file in the `backend/` directory:

```bash
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat_db

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Image Upload Service
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create `.env` file in the `frontend/` directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:5001
```

## Project Architecture

```
murmur/
├── package.json                 # Root scripts & dependencies
├── Readme.md                    # Project documentation
├── .gitignore                   # Git ignore rules
│
├── backend/                     # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/         # Request handlers & business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── message.controller.js
│   │   │   └── upload.controller.js
│   │   ├── lib/                 # Utilities & configurations
│   │   │   ├── cloudinary.js
│   │   │   ├── db.js
│   │   │   ├── socket.js
│   │   │   ├── utils.js
│   │   │   └── validation.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   └── message.model.js
│   │   ├── routes/
│   │   │   ├── auth.route.js
│   │   │   ├── message.route.js
│   │   │   └── upload.route.js
│   │   └── index.js
│   ├── package.json
│   └── eslint.config.js
│
├── frontend/                     # React.js client application
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthImagePattern.jsx
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NoChatSelected.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── skeletons/
│   │   │       ├── MessageSkeleton.jsx
│   │   │       └── SidebarSkeleton.jsx
│   │   ├── constants/
│   │   │   └── index.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── SignUpPage.jsx
│   │   ├── store/
│   │   │   ├── useAuthStore.js
│   │   │   ├── useChatStore.js
│   │   │   └── useThemeStore.js
│   │   ├── lib/
│   │   │   ├── axios.js
│   │   │   ├── cloudinary.js
│   │   │   └── utils.js
│   │   ├── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── eslint.config.js
│
└── node_modules/               # Shared dependencies
```

## API Reference

### Authentication Endpoints

| Method | Endpoint                   | Description                  | Request Body                    |
| ------ | -------------------------- | ---------------------------- | ------------------------------- |
| `POST` | `/api/auth/signup`         | Register new user            | `{ fullName, email, password }` |
| `POST` | `/api/auth/login`          | User authentication          | `{ email, password }`           |
| `POST` | `/api/auth/logout`         | User logout                  | None                            |
| `GET`  | `/api/auth/check`          | Verify authentication status | None                            |
| `PUT`  | `/api/auth/update-profile` | Update user profile          | `{ profilePic }`                |

### Message Management

| Method   | Endpoint                        | Description               | Query Params        |
| -------- | ------------------------------- | ------------------------- | ------------------- |
| `GET`    | `/api/messages/users`           | Get all users for sidebar | None                |
| `GET`    | `/api/messages/:id`             | Get conversation messages | `page`, `limit`     |
| `POST`   | `/api/messages/send/:id`        | Send new message          | `{ text?, image? }` |
| `PUT`    | `/api/messages/read/:id`        | Mark messages as read     | None                |
| `GET`    | `/api/messages/unread/all`      | Get unread message counts | None                |
| `PUT`    | `/api/messages/edit/:messageId` | Edit existing message     | `{ text }`          |
| `DELETE` | `/api/messages/:messageId`      | Soft delete message       | None                |

### Utility Endpoints

| Method | Endpoint                | Description                     | Purpose                 |
| ------ | ----------------------- | ------------------------------- | ----------------------- |
| `GET`  | `/api/upload/signature` | Get Cloudinary upload signature | Direct image uploads    |
| `GET`  | `/api/health`           | Health check endpoint           | Monitoring & deployment |

## WebSocket Events

### Client → Server Events

```javascript
socket.emit("typing", { receiverId: "user_id" });
socket.emit("stopTyping", { receiverId: "user_id" });
```

### Server → Client Events

```javascript
socket.on("newMessage", (message) => {
  /* Handle new message */
});
socket.on("userTyping", ({ senderId, isTyping }) => {
  /* Update UI */
});
socket.on("getOnlineUsers", (userIds) => {
  /* Update online status */
});
socket.on("messagesRead", ({ readBy, count }) => {
  /* Mark as read */
});
socket.on("messageEdited", (message) => {
  /* Update message */
});
socket.on("messageDeleted", ({ messageId }) => {
  /* Remove message */
});
```

## Features in Detail

### Real-time Messaging

- **Sub-second message delivery** via Socket.IO with automatic reconnection
- **Optimistic UI updates** for immediate visual feedback (messages appear
  instantly)
- **Message status indicators**: Sent (✓), Delivered (✓✓), Read (✓✓ blue)
- **Message pagination** with infinite scroll for performance optimization
- **Message editing & deletion** with real-time synchronization across clients

### Image Sharing System

- **Direct Cloudinary uploads** bypass server for improved performance
- **Real-time image preview** with loading states and error handling
- **Multi-format support**: JPEG, PNG, GIF, WebP with automatic optimization
- **File size limits**: 5MB maximum with client-side validation
- **Image compression** and CDN delivery for fast loading

### User Experience Features

- **Smart typing indicators** with 2-second auto-timeout to prevent stuck states
- **Online presence system** with real-time status updates and connection
  handling
- **Debounced search** (300ms delay) for smooth contact filtering
- **Responsive design** optimized for desktop, tablet, and mobile devices
- **Form state management** with automatic cleanup when switching conversations
- **Toast notifications** for user feedback (success, error, loading states)

### Security & Validation

- **JWT authentication** with secure httpOnly cookies
- **Comprehensive input validation** using Zod schemas on both client and server
- **CORS protection** with environment-specific allowed origins
- **XSS protection** through proper data sanitization
- **Password security** with bcrypt hashing (10 salt rounds)

## Production Deployment

### Pre-deployment Checklist

- [ ] MongoDB connection string configured
- [ ] Cloudinary credentials set up
- [ ] Environment variables configured for production
- [ ] Frontend build tested locally (`npm run build`)
- [ ] Backend health check endpoint accessible

### Recommended Hosting Platforms

#### Frontend (Static Site Hosting)

- **Vercel** (Recommended) - Automatic deployments from Git
- **Netlify** - Great for React applications
- **Render Static Sites** - Simple deployment process

#### Backend (Node.js Hosting)

- **Render** (Recommended) - Free tier available with auto-sleep
- **Railway** - Developer-friendly with automatic builds
- **Heroku** - Classic choice with extensive add-ons

### Production Environment Variables

Update your environment variables for production:

**Backend `.env`**:

```bash
NODE_ENV=production
PORT=5001
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_super_secure_production_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend `.env`**:

```bash
VITE_API_URL=https://your-backend-domain.com
```
