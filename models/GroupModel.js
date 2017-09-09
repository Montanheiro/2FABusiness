const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  companyID: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },

  name: require('./fields/field.js')('String'),
  description: require('./fields/field.js')('String')
});

GroupSchema.plugin(require('./plugins/timestamp.js'));


module.exports = mongoose.model('Group', GroupSchema);
