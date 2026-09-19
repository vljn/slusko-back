import multer from 'multer';
import path from 'path';
import fs from 'fs';

const clipsDir = path.resolve(__dirname, '../../clips');
if (!fs.existsSync(clipsDir)) {
  fs.mkdirSync(clipsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, clipsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

const uploadSong = multer({ storage });

export default uploadSong;
