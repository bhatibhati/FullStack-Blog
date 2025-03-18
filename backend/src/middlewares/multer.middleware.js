// import multer from 'multer'

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, '../public/temp')
//     },
//     filename: function (req, file, cb) {
//         // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         // cb(null, file.fieldname + '-' + uniqueSuffix)
//         cb(null, file.originalname)
//     }
// })

// export const upload = multer({
//     storage,
// })



import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../public/temp'); // ✅ Fix: Absolute path
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Allow multiple files
export const upload = multer({
    storage,
});
