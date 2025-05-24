const express = require('express');
const app = express();
const port = process.env.port || 3000;

app.get('/', (req, res) => {
    res.send('Привіт, я Антон');
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});