const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const Product = require('./model/products/productModel');
const Order = require('./model/orders/orderModel');
const app = express();
const server = http.createServer(app);

console.clear()

app.use("/",(req,res,next)=>{
  console.clear();
  next()
})
// Middlewares
app.use(helmet());
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Socket.IO Configuration
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:2253",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const productRouter = require('./model/products/productRouter');
const userRouter = require('./model/users/userRouter');
const orderRouter = require('./model/orders/orderRouter');

app.use('/', productRouter);
app.use('/', userRouter);
app.use('/', orderRouter);
app.use('/uploads', express.static('uploads'));


// Additional routes
// روت جدید برای دریافت سفارشات pending


// Socket.IO Events
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  
  socket.on('new-order', (orderData) => {
    // Process the new order
    console.log('New order received:', orderData);
    // Broadcast to admin panel
    io.emit('order-updated', orderData);
  });
  
  socket.on('order-delivered', (data) => {
    io.emit('order-delivered', data);
  });
    socket.on('update-order-status', (data) => {
        // اطلاع به تمام کلاینت‌ها
        io.emit('order-status-updated', data);
    });
});
// Error handlers
process.on('unhandledRejection', (err) => {
  logger.error(`خطای unhandledRejection: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`خطای uncaughtException: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});

// Start server
const PORT = process.env.PORT || 2253;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});