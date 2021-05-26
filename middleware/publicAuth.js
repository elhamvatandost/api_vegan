var jwt = require('jsonwebtoken');

let publicAuth = (req,res,next)=>{
    try {
        let token = req.header('credit');
        var decoded = jwt.verify(token, 'mzjvmi4ltuxxhhd6evu9p89gv');
        if(decoded.data != 'isAuth'){
            res.status(401).send();
        }else{
            next();
        }
    } catch (e) {
        res.status(401).send();
    }


};

module.exports = {
    publicAuth
}