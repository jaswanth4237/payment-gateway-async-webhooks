require('dotenv').config();
const app = require('./app');
const db = require('./db');

const PORT = process.env.PORT || 8000;

db.initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`API running on port ${PORT}`);
    });
});
