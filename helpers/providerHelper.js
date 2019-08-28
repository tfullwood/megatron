const axios = require('axios');
const path = require('path');
const jsonfile = require('jsonfile')
const mkdirp = require('mkdirp');

function apiImporter(data, host_path, endpoint, limit, offset) {
    return axios.get(`${host_path}/${endpoint}?limit=${limit}&offset=${offset}`)
        .then((res) => {
            //Concat regardless of next step
            data.data[endpoint] = data.data[endpoint].concat(res.data[endpoint])

            //Loop back through this func for more data
            if (res.data[endpoint].length === limit) {
                return apiImporter(data, host_path, endpoint, limit, (limit + offset))
            }

            //res.data is either 0 or lower than the limit, already ran concat on this so now just return data
            return data
        })
}

//NOTE - this operation is synchronous - was lazy and didn't want to deal with more async hell

//Also it's not really reusable and would be relatively simple to make it so
function originalFileHelper(data) {
    let dir = path.join(__dirname, `../data/${data.agent._id}`)
    let filePath = `${dir}/original_${data.job._id}.json`

    mkdirp.sync(dir, (err) => {
        if (err) return Promise.reject('Error creating directory for data')
        //Success
        console.log('Directory created');
    })

    jsonfile.writeFileSync(filePath, data.data, function (err) {
        if (err) return Promise.reject('Error writing the .json file')
        //Success
        console.log(`JSON file written and saved in /data/${data.agent._id} dir`);
    })

    //Nothing new written just returning data to pass through to next step in loop
    return data
}

module.exports = {
    apiImporter,
    originalFileHelper
}