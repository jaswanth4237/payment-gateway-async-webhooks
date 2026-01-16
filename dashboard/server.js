const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/dashboard/webhooks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/webhooks.html'));
});

app.get('/dashboard/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/docs.html'));
});

// Default to docs or login
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Dashboard service running on port ${PORT}`);
});
