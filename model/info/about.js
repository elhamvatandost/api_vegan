const {mongoose} = require('../../db/mongoose');

let AboutSchema  = new mongoose.Schema({
    title : {
        type : String ,
        required : true
    },subtitle : {
        type : String ,
        required : true
    },url : {
        type : String ,
        required : true
    },location : {
        type : String ,
        required : true
    },locationLink : {
        type : String ,
        required : true
    },tags : [{
        type : String ,
        required : true
    }],email :{
        type : String ,
        required : true
    },phones : [{
        type : String ,
        required : true
    }],time : {
        type : String ,
        required : true
    },telegram : {
        type : String ,
        required : true
    },whatsapp : {
        type : String ,
        required : true
    },instagram : {
        type : String ,
        required : true
    },userId : {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    },logo : {
        type: mongoose.Types.ObjectId,
        required : true
    },about : {
        type : String,
        required : true
    },aboutImg : {
        type: mongoose.Types.ObjectId,
        required : true
    }

});



let About = mongoose.model('About', AboutSchema);

module.exports = {
    About
};