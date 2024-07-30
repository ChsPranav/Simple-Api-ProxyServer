const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const rateLimitRequests = process.env.RATE_LIMIT || 5;
const cacheDuration = process.env.CACHE_DURATION || 300;
const weatherApiKey = process.env.WEATHERSTACK_API_KEY;

// Create a new cache instance
const cache = new NodeCache({ stdTTL: cacheDuration });

// Middleware for logging
app.use(morgan(':date[iso] :remote-addr :method :url :status :response-time ms :res[content-length]'));

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: rateLimitRequests,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next, options) => {
        res.setHeader('RateLimit-Status', 'exceeded');
        res.status(429).send('Too many requests. Please try again later.');
    }
});

app.use(limiter);

// Basic authentication middleware
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `subscription_key ${process.env.AUTH_TOKEN}`) {
        return res.status(401).send('Unauthorized');
    }
    next();
});

// Logging rate limit status
app.use((req, res, next) => {
    res.on('finish', () => {
        const rateLimitStatus = req.rateLimitStatus || 'within limit';
        morgan.token('rateLimitStatus', () => rateLimitStatus);
    });
    next();
});

app.get('/proxy', async (req, res) => {
    const query = req.query.query || 'New Delhi';
    console.log(weatherApiKey);
    const apiUrl = `http://api.weatherstack.com/current?access_key=${weatherApiKey}&query=${query}`;

    const cacheKey = apiUrl;

    // Check if the response is cached
    if (cache.has(cacheKey)) {
        return res.json(cache.get(cacheKey));
    }

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Cache the response
        cache.set(cacheKey, data);

        res.json(data);
    } catch (error) {
        console.error('Error fetching from external API:', error);
        if (error.response) {
            res.status(error.response.status).send('Error fetching from external API');
        } else if (error.request) {
            res.status(502).send('Bad Gateway');
        } else {
            res.status(500).send('Internal Server Error');
        }
    }
});

app.listen(port, () => {
    console.log(`API Proxy Server running on port ${port}`);
});
