const express = require('express');
const router = express.Router();
const File = require('../models/file');

// we will move to this page here download link will be shown
// here : means that it will be dynamic and change according to files
router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        if (!file) {
            return res.render('download', { error: 'Link has been Expired' });
        }
        return res.render('download', {
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
        });
    } catch (err) {
        return res.render('download', { error: 'Something Went Wrong' });
    }
});

module.exports = router;
