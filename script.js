const File = require('./models/file');
const fs = require('fs');
const connectDB = require('./config/db');
connectDB();

async function deleteData(){
    const pastDate = new Date(Date.now() - 1000*60*60*24);
    const files = File.find({createdAt: {$lt : pastDate}});
    if(files.length){
        for(const file of files){
            try {
                fs.unlinkSync(file.path);
                await file.remove();
                console.log(`Successfully deleted ${file.filename}`);
            } catch (err) {
                console.log(`Error while deleting File ${err}`);
            }
        }
        console.log('Job Done!');
    }
}
deleteData().then(process.exit);