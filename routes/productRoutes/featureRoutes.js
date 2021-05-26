const express = require('express');
const _ = require('lodash');
const { authenticate }  = require('../../middleware/authenticate');
const {Feature} = require('../../model/product/feature');
const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');

const featureRouter = express.Router();

featureRouter.post('/' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['title','icon','text']);
        handleNullCollection(body , ['title','icon','text'] ,async (e)=>{
        if(e){
            handleError(res,e);
        }else{
            let feature = new Feature(Object.assign({
                userId : req.user._id
            } , body));
            await feature.save().then(()=>{
                handleMessage(res , feature);
            });
        }
    });
    } catch (e) {
        handleError(res , e);
    }
});
featureRouter.put('/' , authenticate,   (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','title','icon','text']);
        handleNullCollection(body , ['_id','title','icon','text'] , (e)=>{
            if(e){handleError(res,e);}
            else{
                Feature.findById(body._id, async (e,f)=>{
                    if(e){
                        handleError(res,e);
                    }else{
                        f.title = body.title;
                        f.icon = body.icon;
                        f.text = body.text;
                        f.userId = req.user._id
                        await f.save().then(()=>{
                            handleMessage(res , f);
                        });
                    }
                });
            }
        })
    } catch (e) {
        handleError(res , e);
    }
});
featureRouter.get('/', authenticate ,(req,res)=>{
    Feature.find({}).exec((e,r)=>{
        if(e){
            handleError(res,e);
        }
        handleMessage(res,r);
    });
});
featureRouter.delete('/:id' ,(req,res)=>{
    try {
        Feature.findById(req.params.id ,  async (e,f)=>{
            if(e){
                handleError(res,e);
            }else{
                await f.remove().then(()=>{
                    handleMessage(res,{});
                });
            }
        });
    } catch (e) {
        handleError(res , e);
    }
});
featureRouter.get('/detail/:id' , (req,res)=>{
    Feature.findById(req.params.id).exec((e,f)=>{
        if(e){
            handleError(res,e);
        }
        handleMessage(res,f);
    })
});

featureRouter.get('/feature' , (req,res)=>{
    let q = req.query.q;
    Feature.find({title : new RegExp(q,'i')}).select('_id title').exec((e,r)=>{
        if(e){
            handleError(res,e);
        }
        handleMessage(res,r);
    });
});

module.exports = {
    featureRouter
};
