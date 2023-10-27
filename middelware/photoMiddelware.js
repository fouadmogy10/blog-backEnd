const path = require("path")
const multer = require("multer")


//Setting storage engine
const storageEngine = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../images"))
    },

    filename: (req, file, cb) => {
        if (file) {

            cb(null, `${Date.now()}--${file.originalname}`);
        } else {
            cb(null, false);
        }
    },
});

// photo upload middelware


const uploadPhoto = multer({
    storage: storageEngine,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {
          return cb(null, true);
        } else {
          return cb(null, false, new Error({ message: "Unsupported file format" }));
        }
      },
    limits: { fileSize: 1024*1024*5 },
});


module.exports=uploadPhoto;