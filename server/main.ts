import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
const PORT = 8000;

console.log("Setting up static file serving...");
app.use(express.static(path.join(__dirname, "..", "app", "dist")));

app.get(/(.*)/, (_, res) => {
    console.log("Serving index.html for unmatched route");
    res.sendFile(path.join(__dirname, "..", "app", "dist", "index.html"));
});

const venvPath = path.join(__dirname, "venv");

function ensureVenv(): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log("Checking for venv at:", venvPath);
        if (fs.existsSync(venvPath)) {
            console.log("venv exists, skipping creation.");
            return resolve();
        }
        
        console.log("venv does not exist, creating...");
        const pythonCmd = process.platform === "win32" ? "python" : "python3";
        console.log(`Spawning process: ${pythonCmd} -m venv venv`);
        const child = spawn(pythonCmd, ["-m", "venv", "venv"], {
            cwd: __dirname,
            shell: true,
        });

        child.stdout?.on("data", (data) => {
            console.log(`[venv creation stdout]: ${data}`);
        });
        child.stderr?.on("data", (data) => {
            console.error(`[venv creation stderr]: ${data}`);
        });

        child.on("close", (code) => {
            console.log(`venv creation process exited with code ${code}`);
            if (code !== 0) {
                return reject(new Error("Failed to create Python venv"));
            }
            // Install dependencies from requirements.txt
            const pipExecutable = process.platform === "win32"
                ? path.join("venv", "Scripts", "pip.exe")
                : path.join("venv", "bin", "pip3");
            console.log(`Installing dependencies using: ${pipExecutable}`);
            const install = spawn(pipExecutable, [
                "install",
                "-r",
                "requirements.txt",
            ], { cwd: __dirname, shell: true });

            install.stdout?.on("data", (data) => {
                console.log(`[pip install stdout]: ${data}`);
            });
            install.stderr?.on("data", (data) => {
                console.error(`[pip install stderr]: ${data}`);
            });

            install.on("close", (installCode) => {
                console.log(`pip install process exited with code ${installCode}`);
                if (installCode !== 0) {
                    return reject(new Error("Failed to install Python dependencies"));
                }
                resolve();
            });
            install.on("error", (err) => {
                console.error("Error during pip install:", err);
                reject(err);
            });
        });
        child.on("error", (err) => {
            console.error("Error during venv creation:", err);
            reject(err);
        });
    });
}

function handlePrompt(req: express.Request, res: express.Response) {
    console.log("Handling prompt:", req.body.prompt);
    const pythonExecutable = process.platform === "win32"
        ? path.join("venv", "Scripts", "python.exe")
        : path.join("venv", "bin", "python3");

    console.log(`Spawning Python process: ${pythonExecutable} processor.py`);
    const pythonProcess = spawn(pythonExecutable, ["processor.py"]);
    let dataString = "";

    pythonProcess.stdin.write(req.body.prompt + "\n");
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
        console.log(`[Python stdout]: ${data}`);
        dataString += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`[Python stderr]: ${data}`);
    });

    pythonProcess.on("close", (code) => {
        console.log(`Python process exited with code ${code}`);
        if (code !== 0) {
            return res.status(500).json({ error: "Python script failed" });
        }
        res.json({
            query: req.body.prompt,
            message: dataString,
        });
    });
}

console.log("Ensuring Python venv and dependencies...");
ensureVenv()
    .then(() => {
        console.log("venv and dependencies ready. Setting up API routes...");
        app.post("/api/prompt", (req, res) => {
            console.log("Received POST /api/prompt");
            handlePrompt(req, res);
        });

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to initialize Python venv or dependencies:", err);
        process.exit(1);
    });
