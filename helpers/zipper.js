const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

function zipper(data, dir) {
    return new Promise(function(resolve, reject) {
        let zipPath = path.join(__dirname, `../data/${data.agent._id}`)

        // create a file to stream archive data to.
        var output = fs.createWriteStream(`${zipPath}/data.zip`);
        var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        
        // listen for all archive data to be written
        // 'close' event is fired only when a file descriptor is involved
        output.on('close', function() {
            resolve('Archiver has finalized and closed')
            // console.log(archive.pointer() + ' total bytes');
            // console.log('archiver has been finalized and the output file descriptor has closed.');
        });
        
        // This event is fired when the data source is drained no matter what was the data source.
        // It is not part of this library but rather from the NodeJS Stream API.
        // @see: https://nodejs.org/api/stream.html#stream_event_end
        output.on('end', function() {
            console.log('Data has been drained');
        });
        
        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on('warning', function(err) {
            reject(err);
            // if (err.code === 'ENOENT') {
            //     // log warning
            //     console.log(err);
            // } else {
            //     // throw error
            //     throw err;
            // }
        });
        
        // good practice to catch this error explicitly
        archive.on('error', function(err) {
            // throw err;
            reject(err);
        });

        archive.pipe(output);
        archive.directory(dir, false);
        archive.finalize();
    })
}

module.exports = {
    zipper
}