const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Group = require('./GroupModel.js');

const TokenSchema = new Schema({
  companyID: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },

  groups: [Group],

  user: require('./fields/field.js')('String'),
  secret: require('./fields/field.js')('String'),
  issuer: require('./fields/field.js')('String')

});

TokenSchema.plugin(require('./plugins/timestamp.js'));


module.exports = mongoose.model('Token', TokenSchema);
