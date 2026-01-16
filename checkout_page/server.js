const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/checkout.html'));
});

// Serve the SDK
app.get('/checkout.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'public/checkout.js'));
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Checkout service running on port ${PORT}`);
});
