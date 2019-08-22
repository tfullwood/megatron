const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const AgentSchema = new Schema({
    dateLastModified: {
        type: Date,
        default: Date.now
    },
    providerType: {
        type: String,
        default: 'eduapi' //TODO - update later maybe? or don't, whatever
    },
    providerApiUrl: {
        type: String
    },
    consumerType: {
        type: String,
        default: 'canvas' //TODO - again, maybe change later?
    },
    consumerApiUrl: {
        type: String
    },
    consumerToken: {
        type: String
    }
});

AgentSchema.statics = {
    get(id) {
        return this.findById(id)
            .then((agent) => {
                if (!agent) {
                    return Promise.reject({
                        message: 'Agent not found',
                        status: 400
                    })
                }

                return agent
            })
            .catch((e) => {
                return Promise.reject({
                    status: e.status || 500,
                    message: e.message || 'Internal server error',
                    stack: e.stack || ''
                })
            })
    } //end get
}

const Agent = mongoose.model('Agent', AgentSchema);

module.exports = { Agent };