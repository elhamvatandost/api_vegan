let Errors = {
    empties: {
        userName : '200000' ,
        password : '200001' ,
        fullname : '200002' ,
        email : '200003' ,
        status : '200004',
        _id : '200005' ,
        icon : '200006',
        text : '200007' ,
        title : '200008',
        index : '200009'
    },nonExistent : {
        user : '300000',
        connection : '300001'
    },invalids : {
        userName : '400000',
        info : '400001' ,
        email : '400002' 
    },duplicates : {
        userName : '500000'
    }
};

Object.freeze(Errors);

module.exports = {
    Errors
};