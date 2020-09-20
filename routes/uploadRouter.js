const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const multer = require("multer")

const storage= multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null , file.originalname)
    }
})
const imageFileFilter = (req, file, cb) => {
    if ( !file.originalname.match(/\.(jpg|jpeg|png|gig)$/)){
        return cb(new Error( "You can only upload image files!"))
    }
    cb(null, true);
};
const upload = multer({storage: storage , fileFilter: imageFileFilter});
const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.get(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
})
.post(authenticate.verifyUser,authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    res.json(req.file);
})
module.exports = uploadRouter;