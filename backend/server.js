const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { User, Session, Item } = require('./models'); // Import models
const loggerMiddleware = require('./loggermiddleware'); // Import the custom logger middleware
const validationMiddleware = require('./validationMiddleware'); // Import the validation middleware
const jwt = require('jsonwebtoken'); // Import JWT

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Apply the logger middleware to send each request log to RabbitMQ
app.use(loggerMiddleware);
app.use(validationMiddleware)

// Secret key for JWT
const JWT_SECRET = 'your_secret_key'; // Replace with a real secret key

// API endpoint to handle login requests
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login request body:', { username, password }); // Log request data

    try {
        // Fetch the user from the database
        const user = await User.findOne({ where: { username } });
        console.log('Fetched user:', user); // Log user details

        // Check if user exists and password is correct
        if (!user || user.password !== password) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiration

        // Create a new session for the user without `createdAt` and `updatedAt`
        const session = await Session.create({
            session_id: `sess_${Date.now()}`,
            user_id: user.id,
            expires:  new Date(Date.now() + 24 * 3600000), // 1 hour from now
            token: token,
        });

        // Send a success response with the session details
        res.status(200).send({ message: 'Login successful', session });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ message: 'An error occurred' });
    }
});

// Apply validationMiddleware to all routes except /login
/*app.use((req, res, next) => {
    if (req.path !== '/login') {
        validationMiddleware(req, res, next);
    } else {
        next();
    }
});
*/

// API endpoint to create a new item
app.post('/items', async (req, res) => {
    const { name, description } = req.body;

    // Validate the request body
    if (!name) {
        return res.status(400).send({ message: 'Name is required' });
    }

    try {
        // Create a new item in the database
        const newItem = await Item.create({ name, description });
        // Respond with the newly created item
        res.status(201).send(newItem);
    } catch (error) {
        console.error('Error creating item:', error);
        // Respond with an error message
        res.status(500).send({ message: 'An error occurred while creating the item' });
    }
});

// API endpoint to get all items
app.get('/items', async (req, res) => {
    try {
        const items = await Item.findAll();
        res.status(200).send(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send({ message: 'An error occurred while fetching the items' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
