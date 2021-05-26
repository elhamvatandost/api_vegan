const {mongoose} = require('../../db/mongoose');
const {Content} = require('./content');
let CategorySchema  = new mongoose.Schema({
    name : {
        type : String ,
        required : true
    },userId : {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    },index : {
        type : Number,
        required : true
    },date : {
        type : Date,
        default : Date.now,
        required : true
    },icon : {
        type: mongoose.Types.ObjectId,
        required : true
    }
});


/** Methods */
CategorySchema.methods.getUser = function(callback){
    User.getUserInfo(this.userId , (e , u)=> {
        if(e){
            return callback(e);
        }
        return callback(null , u);
    });
};

/** Events */
CategorySchema.pre('remove' , function(next) {
    Content.deleteMany({
        catId : this._id
    },(e)=>{
        if(e){
            next(e);
        }else {
            next();
        }
    });
});

let Category = mongoose.model('Category', CategorySchema);

module.exports = {
    Category
};