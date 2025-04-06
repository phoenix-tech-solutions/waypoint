import express from 'express';
import { spawn } from 'child_process';
import path from 'path';

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
const PORT = 8000;

app.get('/api', (req, res) => {
    res.send('Hello, World!');
});

app.post('/api/prompt', (req, res) => {
    const pythonProcess = spawn(path.join("server", "venv", "bin", "python3"), [path.join("server", 'processor.py')]);
    
    let dataString = '';

    // Write input to Python process
    pythonProcess.stdin.write(req.body.prompt + '\n');
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error from Python script: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: 'Python script failed' });
        }
        res.json({
            query: req.body.prompt, // echo back the input
            message: dataString
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});