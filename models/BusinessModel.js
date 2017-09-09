const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let BusinessSchema = new Schema({
  name: require('./fields/required-field.js')('String','isName'),

  status: require('./fields/required-default-field.js')('Boolean', true)
});

BusinessSchema.plugin(require('./plugins/timestamp.js'));

module.exports = mongoose.model('Business', BusinessSchema);