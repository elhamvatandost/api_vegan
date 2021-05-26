const {mongoose} = require('../../db/mongoose');

let VideoSchema  = new mongoose.Schema({
    name : {
        type : String ,
        required : true
    },alias : {
        type : String ,
        required : String ,
        trim : true
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
            ref: 'Video',
            required : true
        }
    }],attach : {
        type: mongoose.Types.ObjectId,
        required : true
    },pic : {
        type: mongoose.Types.ObjectId,
        required : true
    }
});

/** Methods */
VideoSchema.methods.getUser = function(callback){
    User.getUserInfo(this.userId , (e , u)=> {
        if(e){
            return callback(e);
        }
        return callback(null , u);
    });
};

let Video = mongoose.model('Video', VideoSchema);

module.exports = {
    Video
};