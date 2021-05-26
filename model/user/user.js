const validator = require('validator');
const bcrypt  = require('bcryptjs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');

const {mongoose} = require('../../db/mongoose');

const {Errors} = require('../../utils/errors');

let UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },email: {
        type: String,
        required: true,
        unique: true,
        minlength: 6,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: '{Value} is not valid email'
        }
    },password: {
        type: String,
        required:true ,
        minlength: 6,
        required: true
    },userName: {
        type : String,
        required : true,
        unique : true,
        minlength : 6,
        trim : true
    },status : {
        type : Number
    },existDate : {
        type : Date,
        default : Date.now,
        required : true
    },tokens : [{
        access : {
            type : String,
            require : true
        },    
        token : {
            type : String,
            require : true
        }
    }]
});

/** Statics */

UserSchema.statics.getUserInfo = function(userId , callback) {
    let User = this;
    User.findOne({
        _id : userId
    }).select('fullname').exec((e,u) =>{
        if(e){
            return callback(e);
        }
        return callback(null , u);
    });
};

UserSchema.statics.findUserByUserNameAndPassword = function(userName , password) {
    let User = this;

    return User.findOne({
        userName : userName ,
        status: { $ne: 3 },
    }).then((user) => {
        if (!user) {
            return Promise.reject(new Error(Errors.invalids.userName));
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(err){
                    reject(err);
                }
                if (res) {
                    resolve(user);
                } else {
                    reject(res);
                }
            });
        });
    });
};

UserSchema.statics.findByToken = function (token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, config.get('JwtSecret'));
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        status: { $ne: 3 },
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

/** Methods */

UserSchema.methods.genAuthToken = function (){
    let user = this ; 
    let access = 'auth';

    let token = jwt.sign({
        _id : user._id,
        access,
    } , config.get('JwtSecret')).toString();

    user.tokens.push({
        access,
            token 
    }); 

    return user.save().then(()=>{
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    let user = this;

    return user.updateOne({
        $pull: {
            tokens: {
                token
            }
        }
    });
};

/** Events */
UserSchema.pre('save',function(next) {
    let user = this ;


    if (user.isModified('password')){
        bcrypt.genSalt(10 , (err , salt)=>{
            if (err) {
                next(err);
            }else {
            bcrypt.hash(user.password , salt , (err,hash)=>{
                if (err){
                    next(err);
                }else {
                    user.password = hash ;
                    next();
                }
            });
        }
        });
    }
    else {
        next();
    }
});

let User = mongoose.model('User', UserSchema);

module.exports = {
    User
};