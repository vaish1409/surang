const express = require('express');
const cors    = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/artworks', require('./routes/artworks'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/admin',    require('./routes/admin'));

app.get('/', (_req, res) => res.json({ message: 'SURANG API running 🎨' }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SURANG server running on port ${PORT} ✓`));
