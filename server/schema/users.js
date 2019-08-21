const mongoose  = require('mongoose');
const _         = require('lodash');
const bcrypt    = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 15,
        trim: true
    },
    alive: {
        type: Boolean,
        default: true,
    },
    password: {
        type: String,
        minLength: 50,
        maxLength: 50,
        trim: true
    },
    tags : {
        type: [String]
    }
})

// ** Méthodes d'instance **
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id','username', 'alive', 'password', 'tags']);
}

// mongoose middleware
UserSchema.pre('save', function (next) {
    var user = this; //context binding

    // détecte l'insertion ou mise à jour d'un nouveau password
    if (user.isModified('password' || this.isNew)) {
        // cryptage
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next()
    }
})

UserSchema.post('save', function (next) {
    return this._id;
})

UserSchema.methods.comparePassword = function(password) {
    let user = this;
    return bcrypt.compare(password, user.password);
}

var User = mongoose.model('User', UserSchema);
module.exports = { User }