const jwt = require('jsonwebtoken');
const { Session } = require('./models'); // Adjust the path as necessary

const JWT_SECRET = 'your_secret_key'; // Use the same secret key as in your login endpoint

const validationMiddleware = async (req, res, next) => {
    // Skip validation for the /login route
    if (req.path === '/login') {
        return next();
    }

    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log('Authorization header missing');
        return res.status(401).send({ message: 'Missing token or session_id' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token from "Bearer <token>"

    // Check for DFP (Device Fingerprint) in the headers
    const dfp = req.headers['dfp'];
    if (!dfp) {
        console.log('DFP missing');
        return res.status(401).send({ message: 'Missing Device Fingerprint (dfp)' });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded JWT:', decoded);
        
        // Check if the session ID exists and is valid
        const session = await Session.findOne({ where: { token } });
        if (!session) {
            console.log('Invalid session or token:', token);
            return res.status(401).send({ message: 'Invalid session or token' });
        }

        // Verify the DFP (Device Fingerprint)
        if (session.dfp !== dfp) {
            console.log('Invalid DFP:', dfp);
            return res.status(401).send({ message: 'Invalid Device Fingerprint (dfp)' });
        }

        // Attach user ID to the request object for use in subsequent middleware or routes
        req.userId = decoded.userId;
        console.log('User ID attached to request:', req.userId);

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Token validation error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({ message: 'Token expired' });
        }
        res.status(401).send({ message: 'Invalid token' });
    }
};

module.exports = validationMiddleware;
