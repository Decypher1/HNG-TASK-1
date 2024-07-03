
const config = require('./config/config')
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const requestIp = require('request-ip');

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json());

app.get('/', async (req, res) => {
    try {
        let clientIp = requestIp.getClientIp(req);
        console.log('Client IP:', clientIp);

        // Testing with local IP
        if (clientIp.startsWith('::ffff:') || clientIp === '::1' || clientIp === '127.0.0.1') {
            clientIp = '8.8.8.8'; // Example: Google's public DNS server IP address
        }

        // Fetching data with ipinfo.io
        const geoResponse = await axios.get(`https://ipinfo.io/${clientIp}?token=${process.env.IPINFO_TOKEN}`);
        console.log('Geo Response:', geoResponse.data); // Log the entire response data
        const geoData = geoResponse.data;

        if (!geoData || !geoData.city || !geoData.country) {
            throw new Error('Could not determine location from IP address');
        }

        const location = geoData.city
        const name = req.query.name || 'Anonymous';

        // Fetching weather data from weatherapi
        const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json`, {
            params: {
                key: process.env.WEATHER_API_KEY,
                q: location
            }
        });

        console.log('Weather API Response:', weatherResponse.data);

        const temperature = weatherResponse.data.current.temp_c;

        const greeting = `Hello, ${name}! The temperature in ${location} is ${temperature} degrees Celsius.`;
        const response = {
            ip: clientIp,
            location: geoData,
            greeting
        };
        res.json(response);

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));