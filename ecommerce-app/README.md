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

### Local Development

1. Clone the repository
2. Install dependencies for both client and server:
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `server` directory with:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     NODE_ENV=development
     PORT=5000
     ```
   - Create a `.env.development` file in the `client` directory with:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     NODE_ENV=development
     ```

4. Start the development servers:
   ```bash
   # In one terminal (server)
   cd server
   npm run dev
   
   # In another terminal (client)
   cd client
   npm start
   ```

## Deployment

### Option 1: Render.com (Recommended)

1. Push your code to a GitHub repository
2. Go to [Render.com](https://render.com) and sign up/login
3. Create a new Web Service
4. Connect your GitHub repository
5. Configure the service:
   - **Build Command**: `cd client && npm install && npm run build && cd ../server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node
   - **Root Directory**: (leave empty for root)
6. Add environment variables:
   - `NODE_ENV=production`
   - `MONGO_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_jwt_secret`
   - `PORT=10000` (or any port, Render will provide the actual port via `process.env.PORT`)
7. Deploy!

### Option 2: Vercel (Frontend) + Railway/Heroku (Backend)

#### Backend (Railway/Heroku)

1. Push your code to a GitHub repository
2. Follow the deployment guide on [Railway](https://railway.app/) or [Heroku](https://devcenter.heroku.com/)
3. Set the environment variables as shown above

#### Frontend (Vercel)

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com/) and import your project
3. Configure the project:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
4. Add environment variables:
   - `REACT_APP_API_URL=your_backend_url` (e.g., `https://your-railway-or-heroku-app.railway.app/api`)
5. Deploy!

## Environment Variables

### Server (`.env`)

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5000
```

### Client (`.env.development` for local development)

```
REACT_APP_API_URL=http://localhost:5000/api
NODE_ENV=development
```

## Project Structure

```
ecommerce-app/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── App.js         # Main App component
└── server/                # Express backend
    ├── models/           # Mongoose models
    ├── routes/          # API routes
    └── index.js         # Server entry point
```

## Available Scripts

### Client

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Server

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run client` - Start client from server directory

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
