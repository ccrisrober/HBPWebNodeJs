'use strict';

exports = module.exports = function(app, mongoose) {

  var validateEmail = [/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, "Invalid email address"];

  var userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    email: { type: String, unique: true, validate: validateEmail },
    roles: {
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
    },
    isActive: String,
    timeCreated: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    twitter: {},
    github: {},
    facebook: {},
    google: {},
    tumblr: {},
    search: [String],


    photoUrl: { type: String }/*,
    contacts: [Contact]*/

  });


  var Contact = new mongoose.Schema({
    name: {
      first: { type: String },
      last: { type: String }
    },
    accountId: { type: mongoose.Schema.ObjectId },
    added: { type: Date }     // When the contact was added
  });


  app.db.model("Contact", Contact);

  userSchema.methods.addContact = function(account, addcontact) {
    var contact = {
      name: addcontact.name,
      accountId: addcontact._id,
      added: new Date()
    };
    account.contacts.push(contact);

    account.save(function(err) {
      if(err) {
        console.log("Error saving account: " + err);
      }
    });
  };
  userSchema.methods.removeContact = function(account, contactId) {
    if (account.contacts === null) {
      return;
    }

    account.contacts.forEach(function(contact) {
      if(contact.accountId === contactId) {
        account.contacts.remove(contact);
      }
    });
    account.save();
  };
  userSchema.methods.hasContact = function(account, contactId) {
    if(account.contacts === null) {
      return false;
    }

    account.contacts.forEach(function(contact) {
      if (contact.accountId === contactId) {
        return true;
      }
    });
    return false;
  };

  userSchema.methods.canPlayRoleOf = function(role) {
    if (role === "admin" && this.roles.admin) {
      return true;
    }

    if (role === "account" && this.roles.account) {
      return true;
    }

    return false;
  };
  userSchema.methods.defaultReturnUrl = function() {
    var returnUrl = '/';
    if (this.canPlayRoleOf('account')) {
      returnUrl = '/account/';
    }

    if (this.canPlayRoleOf('admin')) {
      returnUrl = '/admin/';
    }

    return returnUrl;
  };
  userSchema.statics.encryptPassword = function(password, done) {
    var bcrypt = require('bcrypt');
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return done(err);
      }

      bcrypt.hash(password, salt, function(err, hash) {
        done(err, hash);
      });
    });
  };
  userSchema.statics.validatePassword = function(password, hash, done) {
    var bcrypt = require('bcrypt');
    bcrypt.compare(password, hash, function(err, res) {
      done(err, res);
    });
  };
  userSchema.plugin(require('./plugins/pagedFind'));
  userSchema.index({ username: 1 }, { unique: true });
  userSchema.index({ email: 1 }, { unique: true });
  userSchema.index({ timeCreated: 1 });
  userSchema.index({ 'twitter.id': 1 });
  userSchema.index({ 'github.id': 1 });
  userSchema.index({ 'facebook.id': 1 });
  userSchema.index({ 'google.id': 1 });
  userSchema.index({ search: 1 });
  userSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('User', userSchema);
};
