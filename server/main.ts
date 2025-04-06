import express from 'express';

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
const PORT = 8000;

app.get('/api', (req, res) => {
    res.send('Hello, World!');
});

app.post('/api/prompt', (req, res) => {
    console.log('Received prompt:', req.body);
    res.json({ message: `Received prompt: ${req.body.prompt}` });
    console.log('Received prompt:', req.body);
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});