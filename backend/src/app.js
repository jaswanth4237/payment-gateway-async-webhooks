const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', paymentRoutes);
app.use('/api/v1', webhookRoutes);
app.use('/api/v1/test/jobs', testRoutes);

module.exports = app;
