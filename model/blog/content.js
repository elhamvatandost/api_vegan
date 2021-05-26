const {mongoose} = require('../../db/mongoose');

let ContentSchema  = new mongoose.Schema({
    name : {
        type : String ,
        required : true
    },alias : {
        type : String ,
        required : String ,
        trim : true
    },catId : {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
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
    }],relateds : [{
        related : {
            type: mongoose.Types.ObjectId,
            ref: 'Content',
            required : true
        }
    }],attaches : [{
        attach : {
            type: mongoose.Types.ObjectId,
            required : true
        },index : {
            type : Number
        }
    }]
});

/** Methods */
ContentSchema.methods.getUser = function(callback){
    User.getUserInfo(this.userId , (e , u)=> {
        if(e){
            return callback(e);
        }
        return callback(null , u);
    });
};


let Content = mongoose.model('Content', ContentSchema);

module.exports = {
    Content
};