const express = require('express');
const _ = require('lodash');
const { access }  = require('../../middleware/access');
const { publicAuth }  = require('../../middleware/publicAuth');
const {Customer} = require('../../model/user/customer');
const {Errors} = require('../../utils/errors');
const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');

const customerRouter = express.Router();

customerRouter.post('/' , publicAuth , (req,res)=>{
    try {
        const body = _.pick(req.body ,['name','phone','product']);
        handleNullCollection(req.body , ['name' ,'phone','product'] , async(e)=>{
            if(e){
                handleError(res,e);
            }else{
                let c = new Customer({
                    name : body.name ,
                    product : body.product ,
                    phone : body.phone
                });
                await c.save().then(()=>{
                    handleMessage(res,c);
                });
            }
        });
    }catch (e) {
        
    }
});
customerRouter.get('/' , access , (req,res)=>{
    Customer.find({}).select('_id name phone product date').sort('-date').exec((e,l)=>{
        if(e){
            handleError(res,e);
        }
        handleMessage(res,l);
    })
});
customerRouter.put('/' , access , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id']);
        handleNullCollection(req.body , ['_id'] , (e)=>{
            Customer.findById(body._id).exec(async(e,u)=>{
                if(e){
                    handleError(res,e);
                }
                await u.remove().then(()=>{
                    handleMessage(res,null);
                });
            });
        });
    } catch (e) {
        handleError(res,e);
    }
});

module.exports = {
    customerRouter
}
