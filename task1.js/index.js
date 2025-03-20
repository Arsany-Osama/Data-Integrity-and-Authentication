require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models/User');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/products', productRoutes);

sequelize.sync().then(() => console.log('Database synced'));

app.listen(3000, () => console.log('Server running on port 3000'));

app.get("/", (req, res) => {
  res.send("Welcome to the Authentication & 2FA API!");
});
