const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CallSchema = new Schema({
  companyID: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  compostoId: require('./fields/field.js')('String'),
  costCall: require('./fields/field.js')('String'),
  call:  require('./fields/field.js')('Mixed', null),

});

CallSchema.plugin(require('./plugins/timestamp.js'));


module.exports = mongoose.model('Call', CallSchema);
