const regex = /^([a-zA-Z0-9_]){5,}$/
module.exports = value => regex.test(value)