const express = require('express');
const _ = require('lodash');
const { authenticate }  = require('../../middleware/authenticate');
const { publicAuth }  = require('../../middleware/publicAuth');
const {Category} = require('../../model/blog/category');
const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');

const categoryRouter = express.Router();

categoryRouter.post('/' , authenticate , async (req,res)=>{
    try {
        const body = _.pick(req.body ,['name','icon','index']);
        handleNullCollection(body , ['name','icon','index'] , async(e)=>{
            if(e){
                handleError(res,e);
            }else {
                let category = new Category(Object.assign({
                    userId : req.user._id
                } , body));
                await category.save().then(()=>{
                    handleMessage(res,category);
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
categoryRouter.put('/' , authenticate , async (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','name','icon','index']);
        handleNullCollection(body , ['_id','name','icon','index'] , (e)=>{
            if(e){
                handleError(res,e);
            }
            Category.findById(body._id , async (e,c)=>{
                if(e){
                    handleError(res,e);
                }else{
                    c.name = body.name;
                    c.icon = body.icon;
                    c.index = body.index;
                    c.userId = req.user._id;
                    await c.save().then(()=>{
                        handleMessage(res,c);
                    })
                }
            });
        });
    } catch (e) {
        handleError(res,e);
    }
});
categoryRouter.delete('/:id' , authenticate , (req,res)=>{
    try {
        Category.findById(req.params.id , async (e,c)=>{
            if(e){
                handleError(res,e);
            }else{
                await c.remove().then(()=>{
                    handleMessage(res,{});
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
categoryRouter.get('/' , authenticate , (req,res)=>{
    Category.find({}).exec((e,l)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,l);
        }
    });
});
categoryRouter.get('/ui/list' , publicAuth , (req,res)=>{
    Category.find({}).select('_id name icon').exec((e,l)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,l);
        }
    });
})
categoryRouter.get('/detail/:id' , authenticate , (req,res)=>{
    Category.findById(req.params.id).exec((e,l)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,l);
        }
    });
});
categoryRouter.get('/cat' , authenticate , (req,res)=>{
    let q = req.query.q;
    Category.find({name : new RegExp(q,'i')}).select('_id name').exec((e,r)=>{
        if(e){
            handleError(res,e);
        }
        handleMessage(res,r);
    });
});

module.exports = {
    categoryRouter
};