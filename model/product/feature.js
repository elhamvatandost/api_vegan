const {mongoose} = require('../../db/mongoose');
const {Product} = require('./product');
let FeatureSchema  = new mongoose.Schema({
    title : {
        type : String , 
        required : true 
    },icon : {
        type: mongoose.Types.ObjectId,
        required : true
    },text : {
        type : String ,
        required : true
    },userId : {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    }
});

/** Methods */
FeatureSchema.methods.getUser = function(callback){
    User.getUserInfo(this.userId , (e , u)=> {
        if(e){
            return callback(e);
        }
        return callback(null , u);
    });
};

FeatureSchema.pre('remove' , function(next){
    Product.find({
        'relateds.related' : this._id
    } , async (e,l)=>{
        if(e){
            next(e);
        }else{
            for await (let element of l){
                element.rmvFeature(this._id , (e)=>{
                    if(e){
                        next(e);
                    }
                });  
            }
            next();
        }
    });
});

let Feature = mongoose.model('Feature', FeatureSchema);

module.exports = {
    Feature
};