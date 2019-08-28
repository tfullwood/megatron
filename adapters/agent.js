const { Agent } = require('../models/agents');
const { Job } = require('../models/jobs');

function getAgent(data) {
    return Agent.get(data.job.agentId)
        .then((agent) => {
            data.agent = agent
            return data
        })
        .catch((e) => {
            return Promise.reject('Failed to fetch agent')
        });
}

function createJob(agentId) {
    var job = new Job({ agentId });

    return job.save()
        .then((job) => {
            return Promise.resolve(job)
        })
        .catch((e) => {
            return Promise.reject('Failed to create Job')
        });
}

function createAgent(req, res, next) {
    //TODO - currently no validation on this endpoint, add it

    var agent = new Agent({
        providerApiUrl: req.body.providerApiUrl,
        consumerApiUrl: req.body.consumerApiUrl,
        consumerToken: req.body.consumerToken
    })

    return agent.save()
        .then((agent) => {
            return res.json(agent)
        })
        .catch((e) => {
            return next({
                status: e.status || 500,
                message: e.message || 'Failed to create agent, idk why',
                stack: e.stack
            })
        });
}

function close(data) {
    //Consider removing the zip and transformed data
        //Probably a good idea since we cannot guarantee a full dataset return from the SIS api
    Job.get(data.job._id)
        .then((job) => {
            job.status = 'complete'

            job.save()
                .then((job) => {
                    //   return res.json({
                    //     job,
                    //     status: 'ok'
                    //   })
                    console.log(`Success, Job ${data.job._id} complete`);
                })
                .catch((e) => {
                    return next({
                        status: 500,
                        message: 'Failed to update job. Internal server error.',
                        stack: e
                    })
                })
        })
        .catch((e) => {
            return next({
                message: e.message,
                status: e.status,
                stack: e
            })
        })
}

module.exports = {
    getAgent,
    createJob,
    createAgent,
    close
}