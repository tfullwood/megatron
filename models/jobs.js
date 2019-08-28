const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const JobSchema = new Schema({
    status: {
        type: String,
        default: 'started'
    },
    dateLastModified: {
        type: Date,
        default: Date.now
    },
    agentId: {
        type: ObjectId
    }
});

JobSchema.statics = {
    get(id) {
      if (ObjectId.isValid(id)) {
        return this.findById(id)
          .then((job) => {
            if (!job) {
              return Promise.reject({
                status: 400,
                message: 'Job not found'
              })
            }
  
            return job
          })
          .catch((e) => {
            return Promise.reject({
              status: e.status || 500,
              message: e.message || 'Internal Server Error',
              stack: e
            })
          })
      } else {
        return Promise.reject({
          status: 400,
          message: 'Invalid ID'
        })
      }
    }, //end get
    // list(start, limit, search, removed) {
    //   query = {}
  
    //   if (!removed) {
    //     query.removed = false
    //   }
  
    //   if (search) {
    //     var search = decodeURIComponent(search)
  
    //     query.$or = [
    //       { title: new RegExp(search, "i") },
    //       { description: new RegExp(search, "i") }
    //     ]
    //   }
  
    //   return this.find(query)
    //     .skip(Number(start))
    //     .limit(Number(limit))
    //     .then((jobs) => {
    //       return jobs
    //     })
    //     .catch((e) => {
    //       return Promise.reject({
    //         status: e.status || 500,
    //         message: e.message || 'Internal Server Error',
    //         stack: e
    //       })
    //     })
    // }
} //end statics

const Job = mongoose.model('Job', JobSchema);

module.exports = { Job };