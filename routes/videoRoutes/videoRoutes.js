const express = require('express');
const _ = require('lodash');
const { authenticate }  = require('../../middleware/authenticate');
const { publicAuth }  = require('../../middleware/publicAuth');
const {Video} = require('../../model/video/video');
const {Product} = require('../../model/product/product');
const {Group} = require('../../model/product/group');
const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');

const videoRouter = express.Router();

videoRouter.post('/' , authenticate ,  (req,res)=>{
    try {
        const body = _.pick(req.body ,['name','alias','text','tags','attach','pic']);
        handleNullCollection(body , ['name','alias','text','attach','pic'] , async(e)=>{
            if(e){
                handleError(res,e);
            }else {
                let video = new Video(Object.assign({
                    userId : req.user._id
                } , body));
                await video.save(()=>{
                    handleMessage(res,{
                        _id : video._id ,
                        name : video.name
                    });
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
videoRouter.put('/' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','name','alias','text','attach','tags','pic']);
        handleNullCollection(body , ['_id','name','alias','text','attach','pic'] , (e)=>{
            if(e){
                handleError(res,e);
            }else {
                Video.findById(body._id , async(e,obj)=>{
                    if(e){
                        handleError(e);
                    }else{
                        obj.name = body.name;
                        obj.alias = body.alias;
                        obj.text = body.text;
                        obj.tags = body.tags;
                        obj.attach = body.attach;
                        obj.pic = body.pic;
                        obj.userId = req.user._id;
                        await obj.save().then(()=>{
                            handleMessage(res,obj);
                        });
                    }
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
videoRouter.delete('/del/:id' , authenticate , (req,res)=>{
    try {
        const id = req.params.id;
        Video.findById(id , async(e,obj)=>{
            if(e){
                handleError(e);
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
videoRouter.get('/' , authenticate , (req,res)=>{
    try {
        Video.find({}).select('_id name').exec((e,l)=>{
            if(e){
                handleError(res,e);
            }
            handleMessage(res,l);
        })
    }catch(e){
        handleError(res,r);
    }
});
videoRouter.get('/detail/:id' , authenticate ,  (req,res)=>{
    try {
        Video.findById(req.params.id).select('_id name alias text tags pic attach').exec((e,l)=>{
            if(e){
                handleError(res,e);
            }
            handleMessage(res,l);
        })
    }catch(e){
        handleError(res,r);
    }
});
videoRouter.get('/ui/list/:page' , publicAuth , (req,res)=>{
    let page = parseInt(req.params.page,10);
    Video.find({}).select('_id name pic alias').skip(page * 9).limit(9).exec((e,l)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,l);
        }
    });
});
videoRouter.get('/ui/page' , publicAuth , async (req,res)=>{
    try {
        let count = await Video.countDocuments({});
        handleMessage(res,{
            count
        });
    } catch (e) {
        handleError(res,e);
    }
});
videoRouter.get('/ui/detail/:alias' , publicAuth , async(req,res)=>{
    Video.findOne({alias : req.params.alias}).select('_id text name attach tags relateds').exec(async (e,v)=>{
        if(e){
            handleError(res,e);
        }else{
            if(!v){
                handleMessage(res,'');
            }else{
                let tmp = [];
                for await (let element of v.relateds){
                    let product = await Product.findById(element.related).select('_id groupId name alias attaches').exec();
                    let gp = await Group.findById(product.groupId).select('name').exec();
                    tmp.push({
                        _id : product._id,
                        name : product.name,
                        alias : product.alias,
                        gp : gp.name,
                        picture : product.attaches.find(element => element.index == 0) ? product.attaches.find(element => element.index == 0).attach : null ,
                    });
                }
                handleMessage(res,{
                    relateds : tmp ,
                    _id : v._id,
                    text : v.text,
                    name : v.name,
                    attach : v.attach,
                    tags : v.tags,
                });
            }
        }
    });
});

videoRouter.put('/relateds' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','related']);
        handleNullCollection(body , ['_id','related'] , (e)=>{
            if(e){
                handleError(res,e);
            }else{
                Video.findById(body._id , async (e,obj)=>{
                    if(e){
                        handleError(res,e);
                    }else{
                        obj.relateds.push({
                            related : body.related
                        })
                        await obj.save().then(()=>{
                            handleMessage(res,'');
                        })
                    }
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
videoRouter.delete('/relateds/:id/:relid' , authenticate , (req,res)=>{
    try {
        Video.findById(req.params.id , async (e,obj)=>{
            if(e){
                handleError(res,e);
            }else{
                obj.relateds.pull({
                    _id : req.params.relid
                })
                await obj.save().then(()=>{
                    handleMessage(res,'');
                })
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
videoRouter.get('/relateds/:id' , authenticate , (req,res)=>{
    try {
        Video.findById(req.params.id ).select('relateds').exec(async (e,obj)=>{
            if(e){
                handleError(res,e);
            }else{
                let tmp = [];
                for await (let element of obj.relateds){
                    let product = await Product.findById(element.related).select('name').exec();
                    tmp.push({
                        _id : element._id,
                        name : product.name
                    });
                }
                handleMessage(res,tmp);
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});


module.exports = {
    videoRouter
}
