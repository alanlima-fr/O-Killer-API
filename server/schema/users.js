const mongoose  = require('mongoose');
const _         = require('lodash');
const bcrypt    = require('bcryptjs');
const jwt = require('jsonwebtoken');
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique:true,
        min: 1,
        max: 25,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required:true,
        max: 100,
    },
    tags : {
        type: [String]
    }
},{timestamps: true})

// ** Méthodes d'instance **
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id','username','email', 'password', 'tags']);
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

UserSchema.methods.comparePassword = function(password) {
    let user = this;
    return bcrypt.compare(password, user.password);
}


UserSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 7);

    let payload = {
        id: this._id,
        email: this.email,
        username: this.username,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(expirationDate.getTime() / 1000, 10)
    });
};

UserSchema.methods.validateJWT = function(token) {
    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const isValid = (
            verified.id === this._id.toString() &&
            verified.email === this.email &&
            verified.username === this.username
        );
        return isValid;
    } catch(error){
        if (error.name == "TokenExpiredError") {
          return true;
        }
        return false;
    }
}
var User = mongoose.model('User', UserSchema);
module.exports = { User }