const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let CompanySchema = new Schema({
  name: require('./fields/required-field.js')('String','isName'),
  email: require('./fields/required-unique-index-field.js')('String', 'isEmail'),
  password: require('./fields/required-field.js')('String', 'isPassword'),

  paymentService:require('./fields/default-field.js')('String', null),
  subscription:  require('./fields/field.js')('Mixed'),
  transaction:  require('./fields/field.js')('Mixed'),

  balance:  require('./fields/required-default-field.js')('String', '0.00'),
  balanceSecurity:  require('./fields/required-default-field.js')('String', '0.00'),

  accessToken: require('./fields/field.js')('String'),
  status: require('./fields/required-default-field.js')('Boolean', true)
});

CompanySchema.plugin(require('./plugins/timestamp.js'));
CompanySchema.plugin(require('./plugins/passwordCriptografy'));

CompanySchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('Company', CompanySchema);