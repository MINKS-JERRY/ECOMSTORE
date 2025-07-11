# E-Commerce Application

A full-stack e-commerce application built with MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication (register/login)
- Role-based access control (Client/Vendor)
- Product management (add, view products)
- Responsive design with Material-UI
- Protected routes
- Error handling and loading states

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB installation

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following content:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the server:
   ```bash
   npm start
   ```
   The server will start on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The application will open in your default browser at `http://localhost:3000`

## Available Scripts

### Server

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon

### Client

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Build the app for production
- `npm run eject` - Eject from create-react-app (irreversible)

## Project Structure

```
ecommerce-app/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # Source files
│       ├── components/     # Reusable components
│       ├── context/        # React context providers
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── utils/          # Utility functions
└── server/                 # Node.js backend
    ├── models/             # MongoDB models
    ├── routes/             # API routes
    └── middleware/         # Custom middleware
```

## Environment Variables

### Server

- `PORT` - Port number (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT authentication

### Client

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
