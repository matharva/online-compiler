const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const CODE_DIRECTORY = path.join(__dirname, "codes");

if (!fs.existsSync(CODE_DIRECTORY)) {
  fs.mkdirSync(CODE_DIRECTORY, { recursive: true });
}

const generateFile = async (format, code) => {
  const jobId = uuid();
  const fileName = `${jobId}.${format}`;
  const filePath = path.join(CODE_DIRECTORY, fileName);

  await fs.writeFileSync(filePath, String(code));
  return filePath;
};
module.exports = { generateFile };
