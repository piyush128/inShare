const router = require('express').Router();
const { error } = require('console');
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const {v4 : uuid4 } = require('uuid');


let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req,file,cb) => {
        const uniquename = `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`;
        cb(null, uniquename); 
    }
})

let upload = multer({
    storage: storage,
    limit: {fileSize: 1000000* 100},
}).single('myfile');

router.post('/' , (req,res) =>{
    

    // Store Files
        upload(req, res, async(err) =>{
            // Validate Request
            if(!req.file){
                return res.json({error: 'All Fields are Required.'});
            }
            
            if(err){
                return res.status(500).send({error: err.message})
            }
            // Store into Database
            const file = new File({
                filename: req.file.filename,
                uuid: uuid4(),
                path: req.file.path,
                size: req.file.size
            });

            const response = await file.save();
            return res.json({file: `${process.env.APP_BASE_URL}/files/${response.uuid}`});
            // http://localhost:3000/files/eknkjce6c5e74-6786erevcr - download link
        })
    

    // Response -> link
})

router.post('/send', async(req,res) => {
    const { uuid, emailTo, emailFrom} = req.body;
    // Validate Request
    if(!uuid || !emailTo || !emailFrom){
        return res.status(422).send({error: 'All Fields are Required'});
    }

    //Get data from database
    const file = await File.findOne({uuid: uuid});
    if(file.sender){
        return res.status(422).send({error: 'Email already Sent.'});
    }

    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();

    // Send email

    const sendMail = require('../services/emailService');
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'inShare File Sharing',
        text: `${emailFrom} shared a file with You.`,
        html: require('../services/emailTemplate')({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: parseInt(file.size/1000) + ' KB',
            expires: '24 hours'
        })
    });

    return res.send({success: true});
})

module.exports = router;