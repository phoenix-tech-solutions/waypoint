import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
const PORT = 8000;


app.use(express.static(path.join(__dirname, '..', 'app', 'dist')));

app.get(/(.*)/, (_, res) => {
  res.sendFile(path.join(__dirname, '..', 'app', 'dist', 'index.html'));
});

process.chdir('server');
app.post('/api/prompt', (req, res) => {
    // Ensure venv exists, if not, create it
    const venvPath = path.join(__dirname, 'venv');
    if (!fs.existsSync(venvPath)) {
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const child = spawn(pythonCmd, ['-m', 'venv', 'venv'], { cwd: __dirname, shell: true });
        child.on('close', (code) => {
            if (code !== 0) {
            console.error('Failed to create venv');
            return res.status(500).json({ error: 'Failed to create Python venv' });
            }
            // Install dependencies from requirements.txt
            const pipExecutable = process.platform === 'win32'
            ? path.join('venv', 'Scripts', 'pip.exe')
            : path.join('venv', 'bin', 'pip3');
            const install = spawn(pipExecutable, ['install', '-r', 'requirements.txt'], { cwd: __dirname, shell: true });
            install.on('close', (installCode) => {
            if (installCode !== 0) {
                console.error('Failed to install dependencies');
                return res.status(500).json({ error: 'Failed to install Python dependencies' });
            } else {
            console.log('Python dependencies installed successfully');
            }
            // After dependencies are installed, continue with the rest of the handler
            handlePrompt(req, res);
            });
            install.on('error', (err) => {
            console.error('Failed to install dependencies:', err);
            return res.status(500).json({ error: 'Failed to install Python dependencies' });
            });
        });
        child.on('error', (err) => {
            console.error('Failed to create venv:', err);
            return res.status(500).json({ error: 'Failed to create Python venv' });
        });
        return;
    }
    // If venv exists, continue as normal
    handlePrompt(req, res);
});

function handlePrompt(req: express.Request, res: express.Response) {
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
}

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
