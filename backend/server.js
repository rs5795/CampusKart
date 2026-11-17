
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// HOME ROUTE
app.get('/', (req, res) => {
    res.send('CampusKart Backend is Running!');
});

// TEST DATABASE CONNECTION
app.get('/test-db', (req, res) => {
    db.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
});

// GET ALL AVAILABLE PRODUCTS
app.get('/api/products', (req, res) => {
    console.log('GET PRODUCTS ROUTE HIT');

    const sql = `
        SELECT * FROM products
        WHERE status = 'available'
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Fetch error:', err);
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
});

// ADD A NEW PRODUCT
app.post('/api/products', (req, res) => {
    console.log('POST PRODUCTS ROUTE HIT');
    console.log('Received data:', req.body);
console.log("POST REQUEST RECEIVED:", req.body);
    const {
        seller_id,
        category_id,
        title,
        description,
        price,
        condition_status
    } = req.body;

    // VALIDATION
    if (
        !seller_id ||
        !category_id ||
        !title ||
        price === undefined ||
        price === null ||
        !condition_status
    ) {
        return res.status(400).json({
            error: 'Please fill all required fields.'
        });
    }

    if (
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0
    ) {
        return res.status(400).json({
            error: 'Price must be greater than zero.'
        });
    }

    const allowedConditions = ['new', 'like_new', 'good', 'fair'];

    if (!allowedConditions.includes(condition_status)) {
        return res.status(400).json({
            error: 'Invalid product condition.'
        });
    }

    const sql = `
        INSERT INTO products
        (
            seller_id,
            category_id,
            title,
            description,
            price,
            condition_status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        Number(seller_id),
        Number(category_id),
        title.trim(),
        description || '',
        Number(price),
        condition_status
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('INSERT ERROR:', err);

            return res.status(500).json({
                error: err.message
            });
        }

        console.log('PRODUCT ADDED:', result.insertId);

        res.status(201).json({
            message: 'Product added successfully!',
            product_id: result.insertId
        });
    });
});

// START SERVER
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`CampusKart server running on port ${PORT}`);
});
