const express = require('express');
const _ = require('lodash');
const { authenticate }  = require('../../middleware/authenticate');
const { publicAuth }  = require('../../middleware/publicAuth');
const {Slide} = require('../../model/info/slide');
const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');

const slideRouter = express.Router();

slideRouter.post('/' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['title','subtitle','index','link','picture']);
        handleNullCollection(body , ['title','subtitle','index','link','picture'] , async (e)=>{
            if(e){
                handleError(res,e);
            }else {
                let slide = new Slide(Object.assign({
                    userId : req.user._id
                } , body));
                await slide.save().then(()=>{
                    handleMessage(res,slide);
                })
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
slideRouter.put('/' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','title','subtitle','index','link','picture']);
        handleNullCollection(body , ['_id','title','subtitle','index','link','picture'] , (e)=>{
            if(e){
                handleError(res,e);
            }
            Slide.findById(body._id , async (e,obj)=>{
                if(e){
                    handleError(res,e);
                }else{
                    obj.title = body.title;
                    obj.subtitle = body.subtitle;
                    obj.index = body.index;
                    obj.link = body.link;
                    obj.picture = body.picture;
                    obj.userId = req.user._id
                    await obj.save().then(()=>{
                        handleMessage(res,obj);
                    })
                }
            });
        });
    } catch (e) {
        handleError(res,e);
    }
});
slideRouter.delete('/:id' , authenticate , (req,res)=>{
    try {
        const id = req.params.id;
        Slide.findById(id , async (e,obj)=>{
            if(e){
                handleError(res,e);
            }else{
                await obj.remove().then(()=>{
                    handleMessage(res,{});
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
slideRouter.get('/admin' , authenticate , (req,res)=>{
    try {
        Slide.find({}).select('_id title subtitle link picture').sort('-index').exec((e,r)=>{
            if(e){
                handleError(res,e);
            }
            handleMessage(res,r);
        });
    }catch (e) {
        handleError(res,e);
    }
});
slideRouter.get('/admin/:id' , authenticate , (req,res)=>{
    try {
        let id = req.params.id;
        Slide.findById({_id : id}).select('_id index title subtitle link picture').sort('-index').exec((e,r)=>{
            if(e){
                handleError(res,e);
            }
            handleMessage(res,r);
        });
    }catch (e) {
        handleError(res,e);
    }
});
slideRouter.get('/ui'  , publicAuth , (req,res)=>{
    try {
        Slide.find({}).select('_id title subtitle picture link').sort('-index').exec((e,r)=>{
            if(e){
                handleError(res,e);
            }
            handleMessage(res,r);
        });
    }catch (e) {
        handleError(res,e);
    }
});

module.exports = {
    slideRouter
};