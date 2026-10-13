require('express-async-errors');
require('dns').setServers(['8.8.8.8', '1.1.1.1']); // Node's resolver can fail on Atlas SRV lookups with some local DNS setups
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Category = require('./models/Category');

const app = express();

// CORS is hardcoded: local Vite dev server + any Netlify site
const allowed = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/, /^https:\/\/[a-z0-9-]+\.netlify\.app$/];
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowed.some((re) => re.test(origin))),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Lost & Found API running' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/items', require('./routes/items'));
app.use('/api/claims', require('./routes/claims'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    if ((await Category.countDocuments()) === 0) {
      for (const name of ['Electronics', 'Documents', 'Bags', 'Wallets', 'Keys', 'Clothing', 'Jewellery', 'Other']) {
        await Category.updateOne({ name }, { name }, { upsert: true });
      }
    }
    app.listen(PORT, () => console.log(`API listening on ${PORT}`));
  })
  .catch((e) => {
    console.error('MongoDB connection failed:', e.message);
    process.exit(1);
  });
