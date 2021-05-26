const {mongoose} = require('../../db/mongoose');

let EmailSchema  = new mongoose.Schema({
    customerId:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },related : {
        type: mongoose.Types.ObjectId,
        ref: 'Content',
        required : true
    }
});

EmailSchema.methods.send = function(callback){
    return callback(null);
};

let Email = mongoose.model('Email', EmailSchema);

module.exports = {
    Email
};