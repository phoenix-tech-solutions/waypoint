import express from 'express';
import { spawn } from 'child_process';
import path from 'path';

const app = express();
app.use(express.json());
const PORT = 8000;

app.get('/api', (req, res) => {
    res.send('Hello, World!');
});

process.chdir('server');
app.post('/api/prompt', (req, res) => {
    const pythonExecutable = process.platform === 'win32' 
        ? path.join("venv", "Scripts", "python.exe") 
        : path.join("venv", "bin", "python3");

    const pythonProcess = spawn(pythonExecutable, ['processor.py']);
    
    let dataString = '';

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
            query: req.body.prompt,
            message: dataString
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});