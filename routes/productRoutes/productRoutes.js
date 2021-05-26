const express = require('express');
const _ = require('lodash');
const { authenticate }  = require('../../middleware/authenticate');
const { publicAuth }  = require('../../middleware/publicAuth');
const {Product} = require('../../model/product/product');
const {Group} = require('../../model/product/group');
const {Feature} = require('../../model/product/feature');
const {Faq} = require('../../model/product/faq');
const {Video} = require('../../model/video/video');
const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');

const productRouter = express.Router();

productRouter.post('/' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['name','alias','groupId','text','tags']);
        handleNullCollection(body , ['name','alias','groupId','text'] , async(e)=>{
            if(e){
                handleError(res,e);
            }else {
                let product = new Product(Object.assign({
                    userId : req.user._id
                } , body));
                await product.save(()=>{
                    handleMessage(res,product);
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
productRouter.put('/' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','name','alias','groupId','text','tags']);
        handleNullCollection(body , ['_id','name','alias','groupId','text'] , (e)=>{
            if(e){
                handleError(res,e);
            }else {
                Product.findById(body._id , async(e,obj)=>{
                    if(e){
                        handleError(e);
                    }else{
                        obj.name = body.name;
                        obj.alias = body.alias;
                        obj.groupId = body.groupId;
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
productRouter.delete('/del/:id' , authenticate , (req,res)=>{
    try {
        Product.findById(req.params.id , async(e,obj)=>{
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
productRouter.get('/' , authenticate , (req,res) => {
    Product.find({}).select('_id name').exec((e,l)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,l);
        }
    });
});
productRouter.get('/detail/:id' , authenticate , (req,res) => {
    Product.findById(req.params.id).select('_id name alias groupId text tags').exec((e,l)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,l);
        }
    });
});
productRouter.get('/ui/list/:alias' , publicAuth ,  (req,res)=>{
    let alias = req.params.alias;
    Group.findOne({
        name : alias
    }).select('_id').exec((e,g)=>{
        if(e){
            handleError(res,e);
        }else{
            if(!g){
                handleError(res,new Error(''));
            }
            else {
                Product.find({
                    groupId : g._id
                }).select('_id name alias attaches').sort('-_id').exec(async (e,l)=>{
                    if(e){
                        handleError(res,e);
                    }else{
                        let a = []
                        for await (let element of l){
                            a.push({
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
    })
});
productRouter.get('/ui/detail/:gp/:alias' , publicAuth , async (req,res)=>{
    try {
        let gp = await Group.findOne({name  : req.params.gp}).select('_id');
        let product = await Product.findOne({alias : req.params.alias , groupId : gp._id});
        let tmp = [];
        for await (let element of product.relateds){
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
        let videos = await Video.find({'relateds.related' : product._id}).select('_id name alias pic');
        let faqs = await Faq.find({'relateds.related' : product._id , status : 1}).limit(10).sort('-date').select('_id title question answer');
        let tmp1 = [];
        for await (let element of product.features){
            let feature = await Feature.findOne({_id : element.feature});
            tmp1.push({
                _id : element._id,
                index : element.index,
                title : feature.title,
                text : feature.text,
                pic : feature.icon,
            });
        }
        handleMessage(res,{
            faqs : faqs,
            tags : product.tags,
            features : tmp1,
            videos : videos,
            relateds : tmp ,
            name : product.name ,
            alias : product.alias,
            text : product.text,
            attaches : product.attaches,
            details : product.details
        });
    } catch (e) {
        handleError(res,e);
    }
});


productRouter.put('/relateds' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','related']);
        handleNullCollection(body , ['_id','related'] , (e)=>{
            if(e){
                handleError(res,e);
            }else{
                Product.findById(body._id , async (e,obj)=>{
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
productRouter.delete('/relateds/:id/:relid' , authenticate , (req,res)=>{
    try {
        Product.findById(req.params.id , async (e,obj)=>{
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
productRouter.get('/relateds/:id' , authenticate , (req,res)=>{
    try {
        Product.findById(req.params.id ).select('relateds').exec(async (e,obj)=>{
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


productRouter.put('/attaches' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','attach','index']);
        handleNullCollection(body , ['_id','attach'] , (e)=>{
            if(e){
                handleError(res,e);
            }else{
                Product.findById(body._id , async (e,obj)=>{
                    if(e){
                        handleError(res,e);
                    }else{
                        obj.attaches.push({
                            attach : body.attach ,
                            index : body.index
                        });
                        await obj.save().then(()=>{
                            handleMessage(res,'');
                        });
                    }
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
productRouter.delete('/attaches/:id/:aid' , authenticate , (req,res)=>{
    try {
        Product.findById(req.params.id , async (e,obj)=>{
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
productRouter.get('/attaches/:id' , authenticate , (req,res)=>{
    Product.findById(req.params.id ).select('attaches').exec(async (e,obj)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,obj.attaches);
        }
    });
});


productRouter.put('/details' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','title','value','index']);
        handleNullCollection(body , ['_id','title','value'] , (e)=>{
            if(e){
                handleError(res,e);
            }else{
                Product.findById(body._id , async (e,obj)=>{
                    if(e){
                        handleError(res,e);
                    }else{
                        obj.details.push({
                            title : body.title ,
                            value : body.value ,
                            index : body.index
                        });
                        await obj.save().then(()=>{
                            handleMessage(res,'');
                        });
                    }
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
productRouter.delete('/details/:id/:did' , authenticate , (req,res)=>{
    try {
        Product.findById(req.params.id , async (e,obj)=>{
            if(e){
                handleError(res,e);
            }else{
                obj.details.pull({
                    _id : req.params.did
                });
                await obj.save().then(()=>{
                    handleMessage(res,'');
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
productRouter.get('/details/:id' , authenticate , (req,res)=>{
    Product.findById(req.params.id ).select('details').exec(async (e,obj)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,obj.details);
        }
    });
});


productRouter.put('/features' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','feature','index']);
        handleNullCollection(body , ['_id','feature'] , (e)=>{
            if(e){
                handleError(res,e);
            }else{
                Product.findById(body._id , async (e,obj)=>{
                    if(e){
                        handleError(res,e);
                    }else{
                        obj.features.push({
                            feature : body.feature ,
                            index : body.index
                        });
                        await obj.save().then(()=>{
                            handleMessage(res,'');
                        });
                    }
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
productRouter.delete('/features/:id/:fid' , authenticate , (req,res)=>{
    try {
        Product.findById(req.params.id , async (e,obj)=>{
            if(e){
                handleError(res,e);
            }else{
                obj.features.pull({
                    _id : req.params.fid
                });
                await obj.save().then(()=>{
                    handleMessage(res,'');
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
productRouter.get('/features/:id' , authenticate , (req,res)=>{
    try {
        Product.findById(req.params.id ).select('features').exec(async (e,obj)=>{
            if(e){
                handleError(res,e);
            }else{
                let tmp = [];
                for await (let element of obj.features){
                    let features = await Feature.findById(element.feature).select('title').exec();
                    tmp.push({
                        _id : element._id,
                        index : element.index,
                        name : features.title
                    });
                }
                handleMessage(res,tmp);
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});


productRouter.get('/product' , authenticate , (req,res)=>{
    let q = req.query.q;
    Product.find({alias : new RegExp(q,'i')}).select('_id name').exec((e,r)=>{
        if(e){
            handleError(res,e);
        }
        handleMessage(res,r);
    });
});

module.exports = {
    productRouter
};
