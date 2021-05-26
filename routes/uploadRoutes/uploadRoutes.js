const express = require("express");
const uploadRouter = express.Router();
const config = require('config');
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const { authenticate }  = require('../../middleware/authenticate');
const { access }  = require('../../middleware/access');
const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');
// Middlewares
uploadRouter.use(express.json());

// DB
const mongoURI = config.get('MONGOURI');

// connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// init gfs
let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});

// Storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = Date.now().toString() + file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
    });
  }
});

const upload = multer({
  storage
});

uploadRouter.post("/" , authenticate ,upload.single("file"), (req, res) => {
  try {
    handleMessage(res,'');
  } catch (e) {
    handleError(res,e);
  }
});

uploadRouter.get("/list", authenticate , (req, res) => {
  gfs.find({}).project({_id:1,filename:1}).sort({_id:-1}).toArray((err, files) => {
    if(err){
      handleError(res,err);
    }
    else {
      handleMessage(res,files);
    }
  });
});

uploadRouter.get("/files/:filename", (req, res) => {
  const file = gfs
    .find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        });
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
});

uploadRouter.get("/statics/:id", (req, res) => {
    try {
      const file = gfs
      .find({
        _id: new mongoose.Types.ObjectId(req.params.id)
      })
      .toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.status(404).json({
            err: "no files exist"
          });
        }
        gfs.openDownloadStream(new mongoose.Types.ObjectId(req.params.id)).pipe(res);
      });
    } catch (error) {
      return res.status(404).json({
        err: "no files exist"
      });
    }
});

uploadRouter.delete("/files/:id", access, (req, res) => {
  gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
    if (err) {
      handleError(res,err);}
    else {
      handleMessage(res,'');
    }
  }); 
});

uploadRouter.get("/videos" , authenticate , (req,res)=>{
  let q = req.query.q;
  gfs.find({contentType : /video/ , filename : new RegExp(q,'i')}).project({_id:1,filename:1}).toArray((err, files) => {
    if(err){
      handleError(res,err);
    }
    else {
      handleMessage(res,files);
    }
  });
});

uploadRouter.get("/images" , authenticate , (req,res)=>{
  let q = req.query.q;
  gfs.find({contentType : /image/ , filename : new RegExp(q,'i')}).project({_id:1,filename:1}).toArray((err, files) => {
    if(err){
      handleError(res,err);
    }
    else {
      handleMessage(res,files);
    }
  });
});

module.exports = {
    uploadRouter
}