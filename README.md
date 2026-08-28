# 💬 Quick-Chat

A full-stack **real-time chat application** built with the **MENN stack** (MongoDB, Express.js, Next.js, Node.js) and Socket.IO.

Quick-Chat allows users to create accounts, authenticate securely, update their profiles, find other users, and exchange messages in real time with online-status tracking.

🔗 **Live Demo:** https://quick-chat-frontend-zeta.vercel.app

---

## ✨ Features

* 🔐 **User Authentication**

  * User registration and login
  * Password hashing with bcrypt
  * JWT-based authentication
  * HTTP-only authentication cookies
  * Protected routes

* 💬 **Real-Time Messaging**

  * Instant one-to-one messaging
  * Real-time message delivery using Socket.IO
  * Persistent chat history stored in MongoDB

* 🟢 **Online User Status**

  * Real-time online/offline user tracking
  * Socket.IO connection management

* 👤 **Profile Management**

  * Update profile picture
  * Image uploads through Cloudinary

* 🔎 **User Discovery**

  * View available users from the chat sidebar
  * Select users to start conversations

* 🎨 **Responsive UI**

  * Built with Next.js and Tailwind CSS
  * DaisyUI components and theming
  * Toast notifications for user feedback
  * Responsive chat interface

* ⚡ **Modern State Management**

  * Zustand for client-side application state
  * Separate authentication and chat state management

---

## 🛠️ Tech Stack

### Frontend

| Technology           | Purpose                 |
| -------------------- | ----------------------- |
| **Next.js**          | React framework         |
| **React**            | User interface          |
| **Tailwind CSS**     | Styling                 |
| **DaisyUI**          | UI components           |
| **Zustand**          | State management        |
| **Socket.IO Client** | Real-time communication |
| **Lucide React**     | Icons                   |
| **React Hot Toast**  | Notifications           |

### Backend

| Technology        | Purpose                 |
| ----------------- | ----------------------- |
| **Node.js**       | Runtime                 |
| **Express.js**    | REST API                |
| **MongoDB**       | Database                |
| **Mongoose**      | MongoDB ODM             |
| **Socket.IO**     | Real-time communication |
| **JWT**           | Authentication          |
| **bcryptjs**      | Password hashing        |
| **Cloudinary**    | Profile image storage   |
| **Cookie Parser** | Cookie handling         |
| **CORS**          | Cross-origin requests   |
| **dotenv**        | Environment variables   |

The frontend package configuration currently uses Next.js 16, React 19, Socket.IO Client, Zustand, Tailwind CSS 4 and DaisyUI. The backend uses Express 5, Mongoose, Socket.IO, JWT, bcryptjs and Cloudinary.

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      Next.js UI      │
                    │      React 19        │
                    └──────────┬───────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
           REST API                      Socket.IO
                │                             │
                ▼                             ▼
       ┌────────────────┐            ┌────────────────┐
       │    Express     │            │  Socket.IO     │
       │     Server     │            │     Server     │
       └───────┬────────┘            └───────┬────────┘
               │                             │
               └──────────────┬──────────────┘
                              ▼
                     ┌─────────────────┐
                     │     MongoDB     │
                     │   + Mongoose    │
                     └─────────────────┘

                              │
                              ▼
                     ┌─────────────────┐
                     │    Cloudinary   │
                     │  Profile Images  │
                     └─────────────────┘
```

The backend exposes authentication and messaging REST endpoints while Socket.IO handles real-time connection and online-user tracking.

---

## 📁 Project Structure

```text
Quick-Chat/
│
├── backend/
│   ├── src/
│   │   ├── controller/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── app/
│   │       ├── components/
│   │       ├── store/
│   │       └── ...
│   │
│   ├── package.json
│   └── next.config.mjs
│
└── README.md
```

---

## 🔑 Authentication Flow

Quick-Chat uses JWT authentication stored in an **HTTP-only cookie**.

```text
User
 │
 ├── Signup / Login
 │
 ▼
Express API
 │
 ├── Validate credentials
 ├── Hash / verify password
 ├── Generate JWT
 │
 ▼
HTTP-only Cookie
 │
 ▼
Protected API Requests
```

Passwords are hashed using bcrypt before being stored, while the JWT is configured with a 7-day expiration and stored as an HTTP-only cookie.

---

## ⚡ Real-Time Messaging

Socket.IO maintains active connections between clients and the backend.

When a user connects:

```text
Client
   │
   │ Socket.IO connection
   ▼
Socket Server
   │
   ├── Identify user
   ├── Store userId → socketId
   └── Broadcast online users
```

When the user disconnects, their socket is removed and the updated online-user list is broadcast to connected clients.

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint                   | Description                 | Auth |
| ------ | -------------------------- | --------------------------- | ---- |
| `POST` | `/api/auth/signup`         | Create a new account        | ❌    |
| `POST` | `/api/auth/login`          | Login user                  | ❌    |
| `POST` | `/api/auth/logout`         | Logout user                 | ❌    |
| `GET`  | `/api/auth/check`          | Check authentication status | ✅    |
| `PUT`  | `/api/auth/update-profile` | Update profile picture      | ✅    |

### Messages

| Method | Endpoint                        | Description              | Auth |
| ------ | ------------------------------- | ------------------------ | ---- |
| `GET`  | `/api/messages/users`           | Get users for sidebar    | ✅    |
| `GET`  | `/api/messages/chatlog/:id`     | Get conversation history | ✅    |
| `POST` | `/api/messages/sendMessage/:id` | Send a message           | ✅    |

These routes are implemented in the backend's authentication and message route modules.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/RTongit/Quick-Chat.git

cd Quick-Chat
```

---

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

NODE_ENV=development
```

The application reads MongoDB from `MONGODB_URI` and Cloudinary credentials from the corresponding environment variables.

---

### 3. Start the Backend

For development:

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

The backend scripts use `nodemon` for development and `node` for production-style startup.

---

### 4. Configure the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

If the frontend requires an API base URL, configure it according to the environment configuration used by the application.

---

### 5. Start the Frontend

```bash
npm run dev
```

The frontend development server runs on:

```text
http://localhost:3000
```

The repository's frontend is configured to run Next.js with Webpack.

---

## 🔒 Security

Quick-Chat implements several security measures:

* Password hashing with **bcrypt**
* JWT authentication
* **HTTP-only cookies**
* Protected backend routes
* CORS configuration with credentials
* Environment variables for secrets
* Authentication middleware for protected resources

---

## 🌐 Deployment

The frontend is deployed on **Vercel**:

https://quick-chat-frontend-zeta.vercel.app

For production deployment, make sure the following are configured:

### Backend

```env
NODE_ENV=production
PORT=your_port
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=your_frontend_url

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend

Configure the production backend URL wherever the frontend API configuration expects it.

Because authentication uses cookies, the production frontend/backend configuration must allow credentials and use the appropriate HTTPS cookie settings.

---

## 📌 What I Learned

Building Quick-Chat provided practical experience with:

* Full-stack JavaScript development
* REST API design
* JWT authentication
* HTTP-only cookies
* Password hashing
* MongoDB and Mongoose
* Real-time communication with Socket.IO
* Managing online user presence
* Zustand state management
* Image uploads with Cloudinary
* CORS and cross-origin authentication
* Next.js App Router
* Deploying frontend and backend separately

---

## 🚧 Future Improvements

Potential improvements for future versions:

* 📎 Image and file messaging
* 🎤 Voice messages
* 👥 Group conversations
* 🔔 Push notifications
* ✍️ Typing indicators
* ✓ Message delivery/read status
* 🗑️ Delete and edit messages
* 🔍 Message search
* 🌙 Improved theme customization
* 📱 Progressive Web App support

---

## 👨‍💻 Author

**Rohan Tamuli**

GitHub: [@RTongit](https://github.com/RTongit)

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

**Quick-Chat — Simple, real-time communication built with modern full-stack technologies.**
## 👥 Contributors

* **Rohan Tamuli** — [@RTongit](https://github.com/RTongit)
* **Nayan Shandilya** — [@nayanshandilya456-blip](https://github.com/nayanshandilya456-blip)
