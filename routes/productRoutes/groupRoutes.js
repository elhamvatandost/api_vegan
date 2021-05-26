const express = require('express');
const _ = require('lodash');
const { authenticate }  = require('../../middleware/authenticate');
const { publicAuth }  = require('../../middleware/publicAuth');
const {Group} = require('../../model/product/group');
const {Product} = require('../../model/product/product');
const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');

const groupRouter = express.Router();

groupRouter.post('/' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['name','icon','index']);
        handleNullCollection(body , ['name','icon','index'] , async (e)=>{
            if(e){
                handleError(res,e);
            }else {
                let group = new Group(Object.assign({
                    userId : req.user._id
                } , body));
                await group.save().then(()=>{
                    handleMessage(res,group);
                })
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
groupRouter.put('/' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','name','icon','index']);
        handleNullCollection(body , ['_id','name','icon','index'] , (e)=>{
            Group.findById(body._id , async (e,g)=>{
                if(e){
                    handleError(res,e);
                }else{
                    g.name = body.name;
                    g.icon = body.icon;
                    g.index = body.index;
                    g.userId = req.user._id
                    await g.save().then(()=>{
                        handleMessage(res,g);
                    })
                }
            });
        });
    } catch (e) {
        handleError(res,e);
    }
});
groupRouter.get('/' , authenticate , (req,res)=>{
    Group.find({}).select('_id icon name index').exec((e,l)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,l);
        }
    });
});
groupRouter.get('/detail/:id' , authenticate , (req,res)=>{
    Group.findById(req.params.id).exec((e,l)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,l);
        }
    });
});
groupRouter.delete('/:id' , authenticate , (req,res)=>{
    try {
        Group.findById(req.params.id , async (e,g)=>{
            if(e){
                handleError(res,e);
            }else{
                await g.remove().then(()=>{
                    handleMessage(res,{});
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
groupRouter.get('/ui' , publicAuth , (req,res)=>{
    let limit = parseInt(req.query.limit, 10) || 6;
    Group.find({}).select('_id icon name').limit(limit).sort('-index').exec(async (e,l)=>{
        if(e){
            handleError(res,e);
        }else{
            let a = []
            for await (let element of l){
                a.push({
                    _id : element._id ,
                    icon : element.icon,
                    name : element.name,
                    count : await Product.countDocuments({
                        groupId : element._id
                    })
                });
            }
            handleMessage(res, a);
        }
    });
});
groupRouter.get('/gp' , authenticate , (req,res)=>{
    let q = req.query.q;
    Group.find({name : new RegExp(q,'i')}).select('_id name').exec((e,r)=>{
        if(e){
            handleError(res,e);
        }
        handleMessage(res,r);
    });
});

module.exports = {
    groupRouter
};