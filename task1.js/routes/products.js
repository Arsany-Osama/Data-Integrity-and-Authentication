const express = require('express');
const { Product } = require('../models/Product');
const jwt = require('jsonwebtoken');

const router = express.Router();

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(403).json({ error: 'Unauthorized' });

    try {
        req.user = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        next();
    } catch {
        res.status(403).json({ error: 'Invalid token' });
    }
};

router.post('/', authenticateJWT, async (req, res) => {
    const product = await Product.create(req.body);
    res.json(product);
});

router.get('/', authenticateJWT, async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
});

router.put('/:id', authenticateJWT, async (req, res) => {
    await Product.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Product updated' });
});

router.delete('/:id', authenticateJWT, async (req, res) => {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
});

module.exports = router;
