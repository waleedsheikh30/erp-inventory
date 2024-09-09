const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 5000;

app.use(cors());

// Middleware
app.use(cors({
  origin: '*', // Allow requests from any origin
  methods: 'GET,POST,PUT,DELETE,OPTIONS', // Allow specific HTTP methods
  allowedHeaders: 'Content-Type,Authorization', // Allow specific headers
  credentials: true // If you need to allow cookies and other credentials
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

const customersRoute = require('./routes/customers');
const productsRoute = require('./routes/products');
const vendorRoute = require('./routes/vendorRoutes');
const paymentRoutes = require('./routes/payment');
app.use('/api/customers', customersRoute);
app.use('/api/products', productsRoute);
app.use('/api/vendors', vendorRoute);
app.use('/api/payments', paymentRoutes);  // Use payment routes

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
