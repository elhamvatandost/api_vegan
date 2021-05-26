const {User} = require('../model/user/user');

let access = (req, res, next) => {
    let token = req.header('x_auth');


    User.findByToken(token).then((user) => {
        if (!user) {
            res.status(401).send();
        }
        else {
            if(user.status == 0) {
                req.user = user;
                req.token = token;
                next();
            }
            else {
                res.status(401).send();
            }
        }
    }).catch((err) => {
        res.status(401).send();
    });
};

module.exports = {
    access
};