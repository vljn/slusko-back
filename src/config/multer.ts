import multer from 'multer';
import path from 'path';
import fs from 'fs';

const songsDir = path.resolve(__dirname, '../../songs');
if (!fs.existsSync(songsDir)) {
  fs.mkdirSync(songsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, songsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

const uploadSong = multer({ storage });

export default uploadSong;
