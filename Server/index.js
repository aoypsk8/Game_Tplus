// index.js
const express = require('express');
const cors = require('cors');
const router = require('./routes/router');
const app = express();
const PORT = 3000;


// Middlewares
app.use(cors());
app.use(express.json());  // Built-in middleware for parsing JSON requests
app.use(express.urlencoded({ extended: true, limit: '500mb', parameterLimit: 50000 }));  // Parse URL-encoded data

// Routes
app.use('/api', router);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
