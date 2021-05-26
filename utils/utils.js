const {Errors} = require('../utils/errors');

let handleMessage = (res, obj ) => {
    res.status(200).json(obj);
};

let handleError = (res, e) => {
    res.status(400).send(e.message);
};

let handleNullCollection = (obj , array , callback) => {
    let list = [];
    array.forEach(element => {
        eval(`
        if(!obj.${element}){    
            list.push(Errors.empties.${element})
        }`);
    });
    if(list.length != 0) {
        return callback(list);
    }else {
        return callback(null);
    }
};

module.exports = {
    handleError,
    handleMessage,
    handleNullCollection
};