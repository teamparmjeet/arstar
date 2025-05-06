const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).single('file');

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

const listFiles = async (storageDirectory) => {
  const files = await readdir(storageDirectory);
  return files;
};

const downloadFile = (fileName, storageDirectory) => {
  const file = validateFileName(fileName, storageDirectory);
  // Check if the file exists
  if (!fs.existsSync(file)) {
    throw new Error('File not found');
  }
  return fs.createReadStream(file);
};
const deleteFile = async (fileName, storageDirectory) => {
  const filePath = path.join(storageDirectory, fileName);
  try {
    await unlink(filePath);
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.log('🚀 ~ error:', error);
    throw new Error('Failed to delete file ');
  }
};


const validateFileName = (fileName, storageDirectory) => {
  const resolved = path.resolve(storageDirectory, fileName);
  if (resolved.startsWith(storageDirectory)) return resolved;
  throw new Error(`Invalid file name: ${fileName}`);
};

module.exports = { upload, listFiles, downloadFile, deleteFile };
