import app from './app.js';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Keep-Alive: প্রতি ৫ মিনিট পর পর পিং পাঠানো
setInterval(() => {
  http.get(`http://localhost:${PORT}`);
  console.log('Keep-Alive: সার্ভার পিং করা হলো');
}, 5 * 60 * 1000); // প্রতি ৫ মিনিটে পিং হবে

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
