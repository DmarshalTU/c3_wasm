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
app.use('/dist', express.static('dist'));

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
            console.log('Logged in successfully, session ID:', sessionID);
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

// Endpoint to fetch clients by inbound ID
app.get('/clients/:inboundId', async (req, res) => {
    const { inboundId } = req.params;
    try {
        const response = await fetch(`${process.env.ENDPOINT}/panel/api/inbounds/get/${inboundId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cookie': sessionID
            }
        });

        const data = await response.json();

        if (response.ok) {
            res.json(data);
        } else {
            console.error(`Error fetching clients for inbound ${inboundId}:`, data);
            res.status(500).send(`Error fetching clients for inbound ${inboundId}`);
        }
    } catch (error) {
        console.error(`Network error fetching clients for inbound ${inboundId}:`, error);
        res.status(500).send(`Network error fetching clients for inbound ${inboundId}`);
    }
});

// Endpoint to fetch client traffic by client ID
app.get('/clientTraffic/:clientId', async (req, res) => {
    const { clientId } = req.params;
    try {
        const response = await fetch(`${process.env.ENDPOINT}/panel/api/inbounds/getClientTrafficsById/${clientId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cookie': sessionID
            }
        });

        const data = await response.json();

        if (response.ok) {
            res.json(data);
        } else {
            console.error(`Error fetching traffic for client ${clientId}:`, data);
            res.status(500).send(`Error fetching traffic for client ${clientId}`);
        }
    } catch (error) {
        console.error(`Network error fetching traffic for client ${clientId}:`, error);
        res.status(500).send(`Network error fetching traffic for client ${clientId}`);
    }
});

// Existing registration endpoint
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

// New endpoint to update the dashboard
app.get('/updateDashboard', async (req, res) => {
    try {
        const groups = await fetchGroups();

        let dashboardHtml = '<div id="dashboard" class="dashboard-container">';

        for (const group of groups) {
            dashboardHtml += `<div class="group"><h2>${group.remark} (ID: ${group.id})</h2>`;

            const clients = await fetchClients(group.id);
            if (clients.length > 0) {
                dashboardHtml += '<ul>';
                for (const client of clients) {
                    const traffic = await fetchClientTraffic(client.id);
                    if (traffic) {
                        const formattedUp = formatBytes(traffic.up);
                        const formattedDown = formatBytes(traffic.down);
                        dashboardHtml += `<li>${client.email} - Up: ${formattedUp} Down: ${formattedDown}</li>`;
                    } else {
                        dashboardHtml += `<li>${client.email} - No traffic data</li>`;
                    }
                }
                dashboardHtml += '</ul>';
            } else {
                dashboardHtml += '<p>No clients found</p>';
            }

            dashboardHtml += '</div>';
        }

        dashboardHtml += '</div>';

        res.send(dashboardHtml);
    } catch (error) {
        console.error('Error updating dashboard:', error);
        res.status(500).send('Error updating dashboard');
    }
});

// Helper functions
async function fetchGroups() {
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
            return data.obj;
        } else {
            console.error('Error fetching groups:', data);
            return [];
        }
    } catch (error) {
        console.error('Network error fetching groups:', error);
        return [];
    }
}

async function fetchClients(inboundId) {
    try {
        const response = await fetch(`${process.env.ENDPOINT}/panel/api/inbounds/get/${inboundId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cookie': sessionID
            }
        });

        const data = await response.json();
        if (response.ok) {
            const settings = JSON.parse(data.obj.settings);
            return settings.clients;
        } else {
            console.error(`Error fetching clients for inbound ${inboundId}:`, data);
            return [];
        }
    } catch (error) {
        console.error(`Network error fetching clients for inbound ${inboundId}:`, error);
        return [];
    }
}

async function fetchClientTraffic(clientId) {
    try {
        const response = await fetch(`${process.env.ENDPOINT}/panel/api/inbounds/getClientTrafficsById/${clientId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cookie': sessionID
            }
        });

        const data = await response.json();
        if (response.ok) {
            return data.obj[0] || null;
        } else {
            console.error(`Error fetching traffic for client ${clientId}:`, data);
            return null;
        }
    } catch (error) {
        console.error(`Network error fetching traffic for client ${clientId}:`, error);
        return null;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = 2;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
