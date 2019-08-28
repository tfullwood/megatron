const providerHelper = require('../../helpers/providerHelper');

function apiImport(data) {
    data.data = {}

    var promises = ['persons', 'educations', 'educationOfferings', 'offeringAssociations'].map(function(dType){
        data.data[dType] = []

        return providerHelper.apiImporter(data, data.agent.providerApiUrl, dType, 100, 0)
            .then((res) => {
                return data.data[dType]
            })
      })
      return Promise.all(promises).then(function(results) {
          return data
      })
}

module.exports = {
    apiImport
}