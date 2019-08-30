const express = require('express');

const agentAdapter = require('../adapters/agent')
const eduApiProviderAdapter = require('../adapters/provider/eduapi')
const providerHelper = require('../helpers/providerHelper')
const canvasAdapter = require('../adapters/consumer/canvas')

const router = express.Router();

//Going to use this to chain requests - avoiding writing a job server
router.post('/jobs', function(req, res, next) {
    // 1. Call the agent.createJob function - creates a DB record for the job, agent information stored based on user provided body param. Returns a job started response.
        //TODO - I should probably just hold on this response til its all done, wanted to expand on this functionality to be an async job but its not there yet...
    // 2. Pass the result to agent.getAgent - gets the agent information based upon the user provided agent param above and stores this info on data.agent
    // 3. Call the EduAPI adapter which recursively maps through all the data types and appends the entire multi-page response to data.data. EduAPI endpoint (and eventually creds) will be pulled from the agent DB response.
    // 4. Create an original file at /data/:agent_id/:job_id.json. Returns the data object with no additional data, will throw a rejected promise if this fails (NOTE - this is a sync process)
    // 5. Run EduAPI -> Canvas transform. Original data file and data.data are stored in the format they were exported (in this case eduapi). Unitl data is stored in a normalized format all adapter types would require a specific provider -> consumer transform process. This process is on the canvas.js consumer adapter. This transformer will run transformation then create CSV files and finally zip the CSV files.
    // 6. Call the consumer adapter (Canvas) API request endpoint. This will call the consumer with the credentials specified in the agent db record.
    // 7. Close the job by writing status=success to the job record in the db.

    data = {}

    agentAdapter.createJob(req.body.agentId)
        .then((job) => {
            res.json({
                status: 'ok',
                job
            })

            //Pass data downstream
            data.job = job
            return data
        })
        .then((data) => agentAdapter.getAgent(data))
        .then((data) => eduApiProviderAdapter.apiImport(data))
        .then((data) => providerHelper.originalFileHelper(data))
        .then((data) => canvasAdapter.eduApiCanvasTransform(data))
        .then((data) => canvasAdapter.apiRequest(data))
        .then((data) => agentAdapter.close(data))
        .catch((e) => {
            //TODO on promise rejection this should record to the db before returning next. Also freturning next will throw an error because my middleware function will attempt to submit another response to the user
            return next ({
                message: e.message || 'There was an issue creating the job',
                status: e.status || 500,
                stack: e.stack || ''
            })
        })
})

//Standalone endpoint to create a new agent
router.post('/', agentAdapter.createAgent);

module.exports = router;