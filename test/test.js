process.env.NODE_CONFIG_DIR ='/home/atta/Documents/Etapower.ir/config';


const {mongoose} = require('../db/mongoose');

let EmailSchema  = new mongoose.Schema({
    index : {
        type : Number,
        required : true
    }
});

EmailSchema.pre('remove' , async function(next){
    let email = new Email({
        index : 4
    });
    await email.save().then(()=>{
        console.log('123')
    });
    console.log('remove');
    await next('amir');
})

let Email = mongoose.model('Email', EmailSchema);

// Email.create({
//     index : 5
// } , (e,email)=>{
//     console.log(email._id)
// })

Email.findOne({
    _id : '5eac3f4bd409261e1fbe4d1a'
} , (e,mail)=>{
    mail.remove();
});