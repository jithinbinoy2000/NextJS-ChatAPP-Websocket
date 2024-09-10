# Chat Application
A real-time chat application built with Node.js, MongoDB, JWT, and Socket.io for the backend, and Next.js for the frontend.

## Features

- Real-time messaging with WebSocket using Socket.io
- User authentication with JWT
- Chat rooms and user management
- Responsive design

## Backend

The backend is built with Node.js and provides the following features:

- **Node.js**: Server-side runtime environment.
- **MongoDB**: NoSQL database for storing user and chat data.
- **JWT**: JSON Web Tokens for secure user authentication.
- **Socket.io**: Real-time bidirectional event-based communication.

## Frontend

The frontend is developed with Next.js and includes:

- **Next.js**: React framework for server-side rendering and static site generation.

## Installation

### Prerequisites

- Node.js (v14 or later)
- MongoDB instance

### Setup

**Clone the repository**


   git clone https://github.com/yourusername/your-repo.git<br>
   cd your-repo <br>
Install backend dependencies<br>



cd Server<br>
npm install<br>
Install frontend dependencies<br>
<br>


cd ../client<br>
npm install<br>

Configure environment variables

Create a .env file in the Server directory and add your MongoDB connection string and other configurations:

.env<br>
MONGO_URI=mongodb://localhost:27017/yourdbname<br>
JWT_SECRET=your_jwt_secret<br>
Run the backend<br>


cd Server <br>
npm start<br>
Run the frontend
<br>


cd ../client<br>
npm run dev<br>
The frontend will be available at http://localhost:3000.
<br>
Usage<br><br><br>
Open http://localhost:3000 in your browser.<br>
Register a new account or log in with an existing one.<br>
Join chat rooms and start messaging in real-time.<br>
Contributing<br>
Feel free to open issues or submit pull requests to improve the application.



Contact
For any questions or support, please contact jithinbinoyp@gmail.com.

