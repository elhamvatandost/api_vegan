const express = require('express');
const _ = require('lodash');
const { authenticate }  = require('../../middleware/authenticate');
const { publicAuth }  = require('../../middleware/publicAuth');
const {Content} = require('../../model/blog/content');
const {Category} = require('../../model/blog/category');
const {Product} = require('../../model/product/product');
const {Group} = require('../../model/product/group');

const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');

const contentRouter = express.Router();

contentRouter.post('/' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['name','alias','catId','text','tags']);
        handleNullCollection(body , ['name','alias','catId','text'] , async(e)=>{
            if(e){
                handleError(res,e);
            }else {
                let content = new Content(Object.assign({
                    userId : req.user._id
                } , body));
                await content.save(()=>{
                    handleMessage(res,content);
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
contentRouter.put('/' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','name','alias','catId','text','tags']);
        handleNullCollection(body , ['_id','name','alias','catId','text'] , (e)=>{
            if(e){
                handleError(res,e);
            }else {
                Content.findById(body._id , async(e,obj)=>{
                    if(e){
                        handleError(e);
                    }else{
                        obj.name = body.name;
                        obj.alias = body.alias;
                        obj.catId = body.catId;
                        obj.text = body.text;
                        obj.tags = body.tags;
                        obj.userId = req.user._id
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
contentRouter.delete('/del/:id' , authenticate ,(req,res)=>{
    try {
        Content.findById(req.params.id , async(e,obj)=>{
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
contentRouter.get('/' , authenticate , (req,res)=>{
    try {
        Content.find({}).select('_id name').exec((e,l)=>{
            if(e){
                handleError(res,e);
            }else{
                handleMessage(res,l);
            }
        })
    } catch (e) {
        handleError(res,e);
    }
});
contentRouter.get('/detail/:id' , authenticate , (req,res)=>{
    Content.findById(req.params.id).select('_id name alias catId text tags').exec((e,c)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,c);
        }
    });
});
contentRouter.get('/ui/page' , publicAuth , async (req,res)=>{
    let cat = req.query.cat;
    try {
        if(!cat){
            let count = await Content.countDocuments({});
            handleMessage(res,{
                count
            });
        }
        else{
            let category = await Category.findOne({name : cat}).select('_id');
            if(!category){
                handleError(res,new Error(''));
            }else{
                let count = await Content.countDocuments({catId : category._id});
                handleMessage(res,{
                    count
                });
            }
        }
    } catch (e) {
        handleError(res,e);
    }
});
contentRouter.get('/ui/list' , publicAuth , async (req,res)=>{
    let cat = req.query.cat;
    let page = req.query.page;
    try {
        if(!cat){
            Content.find({}).skip(page * 10).limit(10).select('_id name catId alias attaches').exec(async (e,l)=>{
                if(e){
                    handleError(res,e);
                }else{
                    let a = []
                    for await (let element of l){
                        a.push({
                            cat : await (await Category.findOne({_id : element.catId}).select('name')).name,
                            _id : element._id,
                            picture : element.attaches.find(element => element.index == 0) ? element.attaches.find(element => element.index == 0).attach : null ,
                            name : element.name,
                            alias : element.alias
                        }); 
                    }
                    handleMessage(res,a);
                }
            });
        }
        else{
            let category = await Category.findOne({name : cat}).select('_id');
            if(!category){
                handleError(res,new Error(''));
            }else{
                Content.find({catId : category._id}).skip(page * 10).limit(10).select('_id name alias attaches').exec(async (e,l)=>{
                    if(e){
                        handleError(res,e);
                    }else{
                        let a = []
                        for await (let element of l){
                            a.push({
                                cat : cat,
                                _id : element._id,
                                picture : element.attaches.find(element => element.index == 0) ? element.attaches.find(element => element.index == 0).attach : null ,
                                name : element.name,
                                alias : element.alias
                            });
                        }
                        handleMessage(res,a);
                    }
                });
            }
        }
    } catch (e) {
        handleError(res,e);
    }
});
contentRouter.get('/ui/detail/:cat/:alias' , publicAuth , async(req,res)=>{
    try {
        let cat = await (await Category.findOne({name : req.params.cat}).select('_id'))._id
        let content = await Content.findOne({alias : req.params.alias , catId : cat}).select('_id name alias text tags relateds attaches');
        let tmp = [];
        for await (let element of content.relateds){
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
            _id : content._id,
            text : content.text,
            name : content.name,
            attaches : content.attaches,
            tags : content.tags,
        });
    } catch (e) {
        handleError(res,e);
    }
});


contentRouter.put('/relateds' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','related']);
        handleNullCollection(body , ['_id','related'] , (e)=>{
            if(e){
                handleError(res,e);
            }else{
                Content.findById(body._id , async (e,obj)=>{
                    if(e){
                        handleError(res,e);
                    }else{
                        obj.relateds.push({
                            related : body.related
                        })
                        await obj.save().then(()=>{
                            handleMessage(res,obj);
                        })
                    }
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
contentRouter.delete('/relateds/:id/:relid' , authenticate , (req,res)=>{
    try {
        Content.findById(req.params.id , async (e,obj)=>{
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
contentRouter.get('/relateds/:id' , authenticate , (req,res)=>{
    try {
        Content.findById(req.params.id ).select('relateds').exec(async (e,obj)=>{
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


contentRouter.put('/attaches' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','attach','index']);
        handleNullCollection(body , ['_id','attach'] , (e)=>{
            if(e){
                handleError(res,e);
            }else{
                Content.findById(body._id , async (e,obj)=>{
                    if(e){
                        handleError(res,e);
                    }else{
                        obj.attaches.push({
                            attach : body.attach ,
                            index : body.index
                        })
                        await obj.save().then(()=>{
                            handleMessage(res,obj);
                        })
                    }
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
contentRouter.delete('/attaches/:id/:aid' , authenticate , (req,res)=>{
    try {
        Content.findById(req.params.id , async (e,obj)=>{
            if(e){
                handleError(res,e);
            }else{
                obj.attaches.pull({
                    _id : req.params.aid
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
contentRouter.get('/attaches/:id' , authenticate , (req,res)=>{
    Content.findById(req.params.id ).select('attaches').exec(async (e,obj)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,obj.attaches);
        }
    });
});


module.exports = {
    contentRouter
}
