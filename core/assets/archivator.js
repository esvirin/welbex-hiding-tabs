const path = require('path');
const archiver = require('archiver');
const fs = require('fs');


const archive = archiver('zip', {zlib: {level: 1}});
const stream = fs.createWriteStream(path.resolve(__dirname, "../../", "widget.zip"));

archive
    .directory(path.resolve(__dirname, "../../", "widget"), false)
    .on('error', err => {
        throw err;
    })
    .pipe(stream);

stream.on('close', () => console.log("the archive has been created"));
archive.finalize();


