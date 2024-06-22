require('dotenv').config();
const mongoose = require('mongoose');

function connectDB() {
    // Database Connection
    mongoose.connect(process.env.MONGO_CONNECTION_URL)
        .then(() => {
            console.log('Database Connected.');
        })
        .catch((err) => {
            console.error('Connection Failed:', err);
        });
}

module.exports = connectDB;
