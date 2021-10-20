const { exec } = require("child_process");

const executePy = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`python ${filePath}`, (error, stdout, stderr) => {
      error && reject({ error, stderr });
      stderr && reject(stderr);
      resolve(stdout);
    });
  });
};

module.exports = { executePy };
