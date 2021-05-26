const {mongoose} = require('../../db/mongoose');

let SlideSchema  = new mongoose.Schema({
    title : {
        type : String ,
        required : true
    },subtitle : {
        type : String ,
        required : true
    },link : {
        type : String ,
        required : true
    },picture : {
        type: mongoose.Types.ObjectId,
        required : true
    },index : {
        type : Number
    },userId : {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    }
});



let Slide = mongoose.model('Slide', SlideSchema);

module.exports = {
    Slide
};