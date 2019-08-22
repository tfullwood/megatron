const mongoose = require('mongoose')
const Schema = mongoose.Schema
var ObjectId = mongoose.Types.ObjectId

var ErrorSchema = new Schema({
  message: {
    type: String
  },
  stack: {
    type: String
  },
  statusCode: {
    type: Number
  },
  environment: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
})

var Error = mongoose.model('Error', ErrorSchema)

module.exports = { Error }