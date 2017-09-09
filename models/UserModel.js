const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const Group = require('./GroupModel.js');

let UserSchema = new Schema({
  name: require('./fields/required-field.js')('String','isName'),
  email: require('./fields/required-unique-index-field.js')('String', 'isEmail'),
  password: require('./fields/required-field.js')('String', 'isPassword'),

  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  groups: [Group],

  accessToken: require('./fields/field.js')('String'),
  status: require('./fields/required-default-field.js')('Boolean', true)
});

UserSchema.plugin(require('./plugins/timestamp.js'));
UserSchema.plugin(require('./plugins/passwordCriptografy'));

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);