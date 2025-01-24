const express = require('express');
const pool = require('./db'); // Ensure this is correctly configured
const cors = require('cors');
const PORT = 5000;

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import Routes
const homeRoutes = require('./routes/home');
const apiRoutes = require('./routes/api');
const setupRoutes = require('./routes/setup');
const helloRoutes = require('./routes/hello');

// Use Routes
app.use('/', homeRoutes);    // Home and POST handler
app.use('/api', apiRoutes);  // API handler
app.use('/setup', setupRoutes); // Setup handler
app.use('/hello', helloRoutes); // Hello handler

// Start the server
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('Visit it at: http://localhost:' + PORT);
});
