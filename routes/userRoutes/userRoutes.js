const express = require('express');
const _ = require('lodash');
const { authenticate }  = require('../../middleware/authenticate');
const { access }  = require('../../middleware/access');
const {User} = require('../../model/user/user');
const {Errors} = require('../../utils/errors');
const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');

const userRouter = express.Router();

userRouter.post('/login' , (req , res) => {
    try {
        const body = _.pick(req.body ,['userName' , 'password']);
        handleNullCollection(body , ['userName' , 'password'] , async (e)=>{
            if(e){
                handleError(res,e);
            }
            else {
                try {
                    let user = await  User.findUserByUserNameAndPassword(body.userName , body.password);
                    if(!user){
                        handleError(res, new Error(Errors.info));
                    }else{
                        let token = await user.genAuthToken();
                        handleMessage(res , {
                            "x_auth":token
                        });
                    }
                } catch (error) {
                    handleError(res,error)
                }

            }
        });

    } catch (e) {
        handleError(res , e);
    }
});
userRouter.delete('/logout', authenticate , async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        
        handleMessage(res , {
            Message: 'Logout successfull.'
        });
    } catch (err) {
        handleError(res, err);
    }
});
userRouter.post('/' , access , (req,res)=>{
    try {
        const body = _.pick(req.body ,['userName','password','fullname','email','status']);
        handleNullCollection(body , ['userName','password','fullname','email','status'] , async (e)=>{
            try {
                if(req.user.status == 0){
                    if(e){
                        res.status(400).send(e);
                    }
                    else{
                        let user = new User(body);
                        await user.save().then(()=>{
                            handleMessage(res , user);
                        });
                    }
                }else{
                    res.status(401).send('');
                }
            } catch (e) {
                res.status(401).send('');
            }
        });
    } catch (e) {
        handleError(res , e);
    }
});
userRouter.get('/' , authenticate , (req , res)=>{
    User.find({
        status: { $ne: 3 },
        _id: { $ne: req.user._id }
    }).select('_id  status fullname email userName existDate').exec((e,l)=>{
        if(e){
            handleError(res , e);
        }
        handleMessage(res , l);
    })
});
userRouter.put('/' , access , (req,res)=>{
    
    const body = _.pick(req.body , ['_id']);
    handleNullCollection(body , ['_id'] , (e)=>{
        if(e){
            res.status(400).send(e);
        }else{
            if(req.user._id.toString() === body._id){
                handleMessage(res,'');
            }else if(req.user.status == 0) {
                User.updateOne({_id : body._id} , {status : 3}).exec((err,u)=>{
                    if(err){
                        handleError(res,e);
                    }else{
                        handleMessage(res,'');
                    }
                });
            }else {
                res.status(401).send('');
            }
        }
    });
});
userRouter.put('/profile' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body , ['userName','fullname','email']);
        handleNullCollection(body,['userName','fullname','email'] , async (e)=>{
            if(e){
                res.status(400).send(e);
            }else{
                req.user.fullname = body.fullname;
                req.user.userName = body.userName;
                req.user.email = body.email;
                await req.user.save().then(()=>{
                    handleMessage(res, {
                        userName : req.user.userName ,
                        fullname : req.user.fullname ,
                        email : req.user.email
                    });
                });
            }
        }); 
    }catch (e) {
        handleError(res,e);
    }
});
userRouter.get('/profile' , authenticate , (req,res)=>{
    handleMessage(res, {
        userName : req.user.userName ,
        fullname : req.user.fullname ,
        email : req.user.email
    });
});
userRouter.put('/password' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body , ['password']);
        handleNullCollection(body,['password'],async(e)=>{
            req.user.password = body.password;
            await req.user.save().then(()=>{
                handleMessage(res,req.user);
            });
        });
    }catch (e) {
        handleError(res,e);
    }
});
userRouter.get('/isValidUserName' , authenticate , (req,res)=>{

    if(req.query.userName.toString() === req.user.userName.toString()){
        handleMessage(res,{
            isExist : false
        });
    }else {
        User.findOne({
            userName : req.query.userName
        }).select('_id').exec((e,u)=>{
            if(e){
                handleError(res,e);
            }else{
                if(!u){
                    handleMessage(res,{
                        isExist : false
                    });
                }else{
                    handleMessage(res,{
                        isExist : true
                    })
                }
            }
        })
    }
});
userRouter.put('/setup' , async (req,res)=>{
    try {
        let user = new User(req.body);
        await user.save().then(()=>{
            handleMessage(res , user);
        });
    } catch (e) {
        handleError(res,e);
    }
});


module.exports = {
    userRouter
}
