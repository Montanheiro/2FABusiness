const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AudioSchema = new Schema({
    name: require('./fields/required-field.js')('String'),
    url: require('./fields/required-field.js')('String'),
    secondTime: require('./fields/required-field.js')('String'),
	minuteTime: require('./fields/required-field.js')('String'),
});

AudioSchema.plugin(require('./plugins/timestamp.js'));

module.exports = mongoose.model('Audio', AudioSchema);
