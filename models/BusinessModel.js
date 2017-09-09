const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let BusinessSchema = new Schema({
  name: require('./fields/required-field.js')('String','isName'),

  paymentService:require('./fields/default-field.js')('String', null),
  subscription:  require('./fields/field.js')('Mixed'),
  transaction:  require('./fields/field.js')('Mixed'),

  price:  require('./fields/required-default-field.js')('String', '0.00'),

  status: require('./fields/required-default-field.js')('Boolean', true)
});

BusinessSchema.plugin(require('./plugins/timestamp.js'));
BusinessSchema.plugin(require('./plugins/passwordCriptografy'));

BusinessSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('Business', BusinessSchema);