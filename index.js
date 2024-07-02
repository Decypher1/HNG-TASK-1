
const config = require('./config/config')
require('dotenv').config()
const express = require('express')
const axios= require('axios')
const PORT = process.env.PORT || 4000

const requestIp = require('request-ip')
const geoip = require('geoip-lite')


const app = express()

app.use(express.json())


app.get('/', async (req, res) => {
    try {
        const clientIp = requestIp.getClientIp(req);
        console.log('clientIP:' + clientIp);
        let location = 'Unknown';

        const geoData = geoip.lookup(clientIp);
        if (geoData && geoData.city) {
            location = `${geoData.city}, ${geoData.country}`;
        }
        console.log('geoData', geoData)
        const name = req.query.name || 'Anonymous';

        //fetch weather data using Axios
        const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json`, {
            params: {
                key: process.env.WEATHER_API_KEY,
                q: location
            }
        });

        const temperature = weatherResponse.data.current.temp_c;

        const greeting = `Hello, ${name}! The temperature in  ${location} is ${temperature} degrees Celsius.`;
        const response = {
            ip: clientIp,
            location: geoData,
            greeting
        }
        res.json(response);

    } catch (error) {
        console.error('Error', error.message);
        res.status(500).json({error: 'Internal server error'})
    }

    })

app.listen (PORT, () => console.log(`Server running on port ${PORT}`))
