const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  tokenID: {
    type: Schema.Types.ObjectId,
    ref: 'Token',
    required: true
  },

  date: require('./fields/required-field.js')('String')

});

LogSchema.plugin(require('./plugins/timestamp.js'));


module.exports = mongoose.model('Log', LogSchema);
