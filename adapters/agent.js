const express = require('express');

const { eduapi } = require('./provider/eduapi');

//Going to use this to chain requests - avoiding writing a job server

function job (req, res, next) {
    return
}

module.exports = {
    job
}