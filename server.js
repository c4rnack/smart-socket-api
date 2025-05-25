require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.json());

const {Pool} = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

app.get('/status/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const result = await pool.query(
            `UPDATE smart_socket
            SET last_seen = NOW()
            WHERE id = $1
            RETURNING is_on`, 
            [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({error: 'Socket not found'});
        }
        res.json({is_on: result.rows[0].is_on});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error: 'Database error'});
    }
});

app.post('/status', async (req, res) => {
    const {id, is_on} = req.body;

    if (typeof is_on !== 'boolean') {
        return res.status(400).json({error: 'is_on must be boolean'});
    }
    try {
        const result = await pool.query(
            `UPDATE smart_socket
            SET is_on = $1,
            last_seen = NOW()
            WHERE id = $2
            RETURNING *`,
        [is_on, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({error: 'Socket not found'});
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error: 'Database error'});
    }
});

app.get('/info/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const result = await pool.query('SELECT is_on, last_seen FROM smart_socket WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({error: 'Socket not found'});
        }
        res.json({is_on: result.rows[0].is_on, last_seen: result.rows[0].last_seen});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error: 'Database error'});
    }
});

app.post('/info', async (req, res) => {
    const {id, is_on} = req.body;

    if (typeof is_on !== 'boolean') {
        return res.status(400).json({error: 'is_on must be boolean'});
    }

    try {
        const result = await pool.query(
            'UPDATE smart_socket SET is_on = $1 WHERE id = $2 RETURNING *',
            [is_on, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({error: 'Socket not found'});
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error: 'Database error'});
    }
});

const port = process.env.port || 3000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});