const {mongoose} = require('../../db/mongoose');

let FaqSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },title : {
        type : String
    },date : {
        type : Date,
        default : Date.now,
        required : true
    },question : {
        type : String,
        required : true
    },answer : {
        type : String,
    },status : {
        required : true ,
        type : Number
    },relateds : [{
        related : {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
            required : true
        }
    }],customer : {
        name : {
            type : String
        },
        phone : {
            type : String
        }
    }
});


let Faq = mongoose.model('Faq', FaqSchema);

module.exports = {
    Faq
};