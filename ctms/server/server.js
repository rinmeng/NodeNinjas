const express = require('express');
const pool = require('./db'); // Ensure this is correctly configured
const cors = require('cors');
const PORT = 5000;

const app = express();

app.use(express.json());
app.use(cors());

const home = require('./routes/home');
const setup = require('./routes/setup');
const user = require('./routes/user');

app.use('/', home);
app.use('/setup', setup);
app.use('/user', user);

// Start the server
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('Visit it at: http://localhost:' + PORT);
});
