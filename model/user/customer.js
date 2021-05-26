const {mongoose} = require('../../db/mongoose');

let CustomerSchema  = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },phone : {
        type : String,
        required : String
    },product : {
        type : String,
        required : String
    },date : {
        type : Date,
        default : Date.now,
        required : true
    }
});


let Customer = mongoose.model('Customer', CustomerSchema);

module.exports = {
    Customer
};