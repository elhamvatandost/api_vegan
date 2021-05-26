const {mongoose} = require('../../db/mongoose');
const {User} = require('../user/user');
const {Faq} = require('./faq');
const {Content} = require('../blog/content');

let ProductSchema  = new mongoose.Schema({
    name : {
        type : String ,
        required : true
    },alias : {
        type : String ,
        required : String ,
        trim : true
    },groupId : {
        type: mongoose.Types.ObjectId,
        ref: 'Group',
        required : true
    },date : {
        type : Date,
        default : Date.now,
        required : true
    },userId : {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    },text : {
        type : String ,
        required : true
    },tags : [{
        type : String ,
        require : true
    }],details : [{
        title : {
            type : String ,
            required : true
        },value : {
            type : String , 
            required : true
        },index : {
            type : Number
        }
    }],relateds : [{
        related : {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
            required : true
        }
    }],attaches : [{
        attach : {
            type: mongoose.Types.ObjectId,
            required : true
        },index : {
            type : Number
        }
    }],features : [{
        feature : {
            type: mongoose.Types.ObjectId,
            required : true
        },index : {
            type : Number ,
            required : true
        }
    }]
});

/** Methods */
ProductSchema.methods.getUser = function(callback){
    User.getUserInfo(this.userId , (e , u)=> {
        if(e){
            return callback(e);
        }
        return callback(null , u);
    });
};


ProductSchema.pre('remove' , async function(next){
    try {
        await Faq.find({
            'relateds.related' : this._id
        } , async (e ,l) =>{
            if(e){
                next(e);
            }else{
                for await (let element of l){
                    element.rmvRelated(this._id , (e)=>{
                        if(e){
                            next(e);
                        }
                    });
                }
            }
        });
        await Content.find({
            'relateds.related' : this._id
        } , async (e ,l) =>{
            if(e){
                next(e);
            }else{
                for await (let element of l){
                    element.rmvRelated(this._id , (e)=>{
                        if(e){
                            next(e);
                        }
                    });
                }
            }
        });
        next();
    } catch (error) {
        next(error)
    }
});

let Product = mongoose.model('Product', ProductSchema);

module.exports = {
    Product
};