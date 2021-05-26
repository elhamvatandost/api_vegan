const {mongoose} = require('../../db/mongoose');
const {Product} = require('./product');

let GroupSchema  = new mongoose.Schema({
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
GroupSchema.methods.getUser = function(callback){
    User.getUserInfo(this.userId , (e , u)=> {
        if(e){
            return callback(e);
        }
        return callback(null , u);
    });
};

GroupSchema.pre('remove' , function(next){
    try {
        Product.find({
            groupId : this._id
        } , async(e , l) => {
            if(e){
                next(e);
            }else{
                for await (let element of l){
                    await element.remove();
                }
                next();
            }
        });
    } catch (error) {
        next(error);
    }
});

let Group = mongoose.model('Group', GroupSchema);

module.exports = {
    Group
};