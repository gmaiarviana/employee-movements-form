const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from src/public
app.use(express.static(path.join(__dirname, 'src/public')));

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
