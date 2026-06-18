const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TIMEOUT_MS = 5000;

function runCode(sourceCode, language, stdin) {
  return new Promise((resolve) => {
    const tempDir = os.tmpdir();
    const id = Date.now() + '_' + Math.random().toString(36).slice(2);

    let filePath, command, args;

    if (language === 'python') {
      filePath = path.join(tempDir, `${id}.py`);
      fs.writeFileSync(filePath, sourceCode);
      command = 'python';
      args = [filePath];
    } else if (language === 'javascript') {
      filePath = path.join(tempDir, `${id}.js`);
      fs.writeFileSync(filePath, sourceCode);
      command = 'node';
      args = [filePath];
    } else {
      return resolve({ stdout: '', stderr: 'Unsupported language', status: 'Error' });
    }

    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, TIMEOUT_MS);

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
      clearTimeout(timer);
      fs.unlink(filePath, () => {});

      if (timedOut) {
        return resolve({ stdout: '', stderr: 'Time Limit Exceeded', status: 'TLE' });
      }

      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        status: code === 0 ? 'Success' : 'Runtime Error',
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout: '', stderr: err.message, status: 'Error' });
    });

    child.stdin.write(stdin || '');
    child.stdin.end();
  });
}

module.exports = { runCode };