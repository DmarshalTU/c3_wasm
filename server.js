const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = 3000;

let sessionID = '';

app.use(express.json());
app.use(express.static('public'));

// Login to get session ID
async function login() {
    try {
        const response = await fetch(`${process.env.ENDPOINT}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                username: process.env.USERNAME,
                password: process.env.PASSWORD
            })
        });

        const data = await response.json();

        if (data.success) {
            sessionID = response.headers.get('set-cookie');
            // console.log('Logged in successfully, session ID:', sessionID);
        } else {
            console.error('Failed to log in:', data.msg);
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

// Call login function at startup to get session ID
login();

// Endpoint to fetch list of groups (inbounds)
app.get('/groups', async (req, res) => {
    try {
        const response = await fetch(`${process.env.ENDPOINT}/panel/api/inbounds/list`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cookie': sessionID
            }
        });

        const data = await response.json();

        if (response.ok) {
            // console.log('Fetched groups:', data);
            res.json(data);
        } else {
            console.error('Error fetching groups:', data);
            res.status(500).send('Error fetching groups');
        }
    } catch (error) {
        console.error('Network error:', error);
        res.status(500).send('Network error');
    }
});

app.post('/register', async (req, res) => {
    const { username, packageId, email, totalGB, expiryTime, enable, groupId } = req.body;
    const clientId = uuidv4();

    const userData = `${username},${clientId},${packageId}\n`;

    // Write to CSV
    fs.appendFile('users.csv', userData, (err) => {
        if (err) {
            return res.status(500).send('Error saving data');
        }
    });

    // Prepare settings for the API request
    const settings = JSON.stringify({
        clients: [
            {
                id: clientId,
                alterId: 0,
                email,
                limitIp: 2,
                totalGB,
                expiryTime,
                enable,
                tgId: "",
                subId: ""
            }
        ]
    });

    // Make API call to add client
    try {
        const apiResponse = await fetch(`${process.env.ENDPOINT}/panel/api/inbounds/addClient`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookie': sessionID
            },
            body: JSON.stringify({ id: groupId, settings: settings })
        });

        const text = await apiResponse.text();

        // console.log('API response status:', apiResponse.status);
        // console.log('API response headers:', apiResponse.headers.raw());
        console.log('API response body:', text);

        try {
            const data = JSON.parse(text);
            if (apiResponse.ok) {
                return res.status(200).send('User registered successfully');
            } else {
                console.error('Error registering user through API:', data);
                return res.status(500).send('Error registering user through API');
            }
        } catch (err) {
            console.error('Failed to parse JSON response:', text);
            return res.status(500).send('Invalid JSON response from server');
        }
    } catch (error) {
        console.error('Network error:', error);
        return res.status(500).send('Network error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
