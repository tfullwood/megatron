const axios = require('axios');
const path = require('path');
const mkdirp = require('mkdirp');
const { parse } = require('json2csv');
const fs = require('fs');
const FormData = require('form-data');

const zipperHelper = require('../../helpers/zipper')

//Not storing this in a DB, this is calling out a specific EduAPI -> Canvas transform process
function eduApiCanvasTransform(data) {
    let dir = path.join(__dirname, `../../data/${data.agent._id}/transformed`)

    mkdirp.sync(dir, (err) => {
        if (err) return Promise.reject('Error creating transformed directory')
        //Success
        console.log('Transformed directory created');
    })
    
    //order - users, accounts, terms, courses, sections, enrollments
    //Should map through an array of these but was lazy so here's this...
    return usersCsv(data.data.persons, dir)
        .then(() => {
            return coursesCsv(data.data.educationOfferings, dir)
                .then(() => {
                    return sectionsCsv(data.data.educationOfferings, dir)
                        .then(() => {
                            return enrollmentsCsv(data.data.offeringAssociations, dir)
                                .then(() => {
                                    return zipperHelper.zipper(data, dir)
                                        .then(() => {
                                            return data
                                        })
                                })
                        })
                })
        })
}

function apiRequest(data) {
    return new Promise(function(resolve, reject) {
        let formData = fs.createReadStream(path.join(__dirname,  `../../data/${data.agent._id}/data.zip`));
        const form = new FormData();
        form.append('attachment', formData, 'data.zip');
        axios.post(`${data.agent.consumerApiUrl}/accounts/1/sis_imports.json?import_type=instructure_csv`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${data.agent.consumerToken}`
            },
            }).then(result => {
                // Handle result…
                resolve(data)
            }).catch(e => {
                console.log('Error posting data to Canvas');
                
                reject(e)
            })
    })

    //Dummy Data Importer
    // return new Promise(function(resolve, reject) {
    //     let formData = fs.createReadStream(path.join(__dirname, `../../data/dummy3.zip`));
    //     const form = new FormData();
    //     form.append('attachment', formData, 'dummy.zip');
    //     axios.post(`${data.agent.consumerApiUrl}/accounts/1/sis_imports.json?import_type=instructure_csv`, form, {
    //         headers: {
    //             ...form.getHeaders(),
    //             Authorization: `Bearer ${data.agent.consumerToken}`
    //         },
    //         }).then(result => {
    //             // Handle result…
    //             resolve(data)
    //         }).catch(e => {
    //             console.log('Error posting data to Canvas');
                
    //             reject(e)
    //         })
    // })
}


//Supporting Functions
function usersCsv(users, dir) {
    var usersPromises = users.map(function(d){
        return Promise.resolve({
            user_id: d._id, //TODO - whenever I change the user obj to read sourcedId instead of _id i'll need to update this and probably a few other places
            login_id: d.username,
            first_name: d.name[0].givenName,
            last_name: d.name[0].surname,
            status: d.status
        })
    })
    return Promise.all(usersPromises).then(function(results) {
        const fields = ['user_id', 'login_id', 'first_name', 'last_name', 'status'];
        const opts = { fields };

        try {
            const csv = parse(results, opts)

            fs.writeFileSync(`${dir}/users.csv`, csv, function(err) {
                if (err) return Promise.reject('Failed to write users.csv file')
            
                console.log('Users.csv was saved to /transformed dir');
            })

            return Promise.resolve()
        } catch (e) {
            return Promise.reject('Failed to users.csv')
        }
    })
}

function coursesCsv(users, dir) {
    var usersPromises = users.map(function(d){
        let status
        
        switch (d.registrationStatus) {
            case 'open':
                status = 'active';
                break;
            default:
                status = 'completed';
        }

        return Promise.resolve({
            course_id: d.sourcedId,
            short_name: d.title,
            long_name: d.title,
            // term_id: d.academicSession.sourcedId, //commenting this because we haven't finished the terms endpoint so I haven't pulled this data in - it'll fail on canvas import
                //don't forget to add it to the fields array below as well
            account_id: d.education.sourcedId,
            status
        })
    })
    return Promise.all(usersPromises).then(function(results) {
        const fields = ['course_id', 'short_name', 'long_name', 'account_id', 'status'];
        const opts = { fields };

        try {
            const csv = parse(results, opts)

            fs.writeFileSync(`${dir}/courses.csv`, csv, function(err) {
                if (err) return Promise.reject('Failed to write courses.csv file')
            
                console.log('Courses.csv was saved to /transformed dir');
            })

            return Promise.resolve()
        } catch (e) {
            return Promise.reject('Failed to create courses.csv')
        }
    })
}

function sectionsCsv(users, dir) {
    var usersPromises = users.map(function(d){
        let status
        
        switch (d.registrationStatus) {
            case 'open':
                status = 'active';
                break;
            default:
                status = 'completed';
        }

        return Promise.resolve({
            section_id: d.sourcedId,
            course_id: d.sourcedId,
            name: d.title,
            status
        })
    })
    return Promise.all(usersPromises).then(function(results) {
        const fields = ['section_id', 'course_id', 'name', 'status'];
        const opts = { fields };

        try {
            const csv = parse(results, opts)

            fs.writeFileSync(`${dir}/sections.csv`, csv, function(err) {
                if (err) return Promise.reject('Failed to write sections.csv file')
            
                console.log('Sections.csv was saved to /transformed dir');
            })

            return Promise.resolve()
        } catch (e) {
            return Promise.reject('Failed to create sections.csv')
        }
    })
}

function enrollmentsCsv(users, dir) {
    var usersPromises = users.map(function(d){

        //Will probably need this soon so just commenting it out - swap the status in the return object below
        // let status
        
        // switch (d.registrationStatus) {
        //     case 'active':
        //         status = 'active';
        //         break;
        //     default:
        //         status = 'inactive';
        // }

        return Promise.resolve({
            section_id: d.educationOfferingId.sourcedId,
            user_id: d.personId.sourcedId,
            role: d.role,
            status: d.status
        })
    })
    return Promise.all(usersPromises).then(function(results) {
        const fields = ['section_id', 'user_id', 'role', 'status'];
        const opts = { fields };

        try {
            const csv = parse(results, opts)

            fs.writeFileSync(`${dir}/enrollments.csv`, csv, function(err) {
                if (err) return Promise.reject('Failed to write enrollments.csv file')
            
                console.log('Enrollments.csv was saved to /transformed dir');
            })

            return Promise.resolve()
        } catch (e) {
            return Promise.reject('Failed to create enrollments.csv')
        }
    })
}

module.exports = {
    eduApiCanvasTransform,
    apiRequest
}