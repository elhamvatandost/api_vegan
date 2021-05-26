const express = require('express');
const _ = require('lodash');
const { authenticate }  = require('../../middleware/authenticate');
const { publicAuth }  = require('../../middleware/publicAuth');
const {Faq} = require('../../model/product/faq');
const {Product} = require('../../model/product/product');

const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');

const faqRouter = express.Router();

faqRouter.post('/ask' , publicAuth ,(req,res)=>{
    try {
        const body = _.pick(req.body ,['question','customer']);
        handleNullCollection(body , ['question','customer'] , async(e)=>{
            if(e){
                handleError(res,e);
            }else {
                let faq = new Faq(Object.assign({
                    status : 0,
                    title : '------------------'
                } , body));
                await faq.save().then(()=>{
                    handleMessage(res,faq);
                })
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
faqRouter.post('/' , authenticate ,  (req,res)=>{
    try {
        const body = _.pick(req.body ,['title','question','answer']);
        handleNullCollection(body , ['title','question','answer'] , async(e)=>{
            if(e){
                handleError(res,e);
            }else {
                let faq = new Faq(Object.assign({
                    userId : req.user._id,
                    status : 1
                } , body));
                await faq.save().then(()=>{
                    handleMessage(res,faq);
                })
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
faqRouter.put('/' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','title','question','answer','status']);
        handleNullCollection(body , ['_id','title','question','answer'] , (e)=>{
            if(e){
                handleError(res,e);
            }else {
                Faq.findById(body._id , async(e,faq)=>{
                    if(e){
                        handleError(res,e);
                    }else {
                        faq.title = body.title;
                        faq.question = body.question;
                        faq.answer = body.answer;
                        faq.status = (body.status === true);
                        faq.userId = req.user._id;
                        await faq.save().then(()=>{
                            handleMessage(res,faq);
                        })
                    }
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
faqRouter.delete('/del/:id' , authenticate , (req,res)=>{
    Faq.findById(req.params.id , async(e,faq)=>{
        if(e){
            handleError(res,e);
        }else {
            await faq.remove().then(()=>{
                handleMessage(res,{});
            })
        }
    });
});
faqRouter.get('/' , authenticate , (req,res) => {
    Faq.find({}).select('_id title status date').sort('-date').exec((e,l)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,l);
        }
    });
});
faqRouter.get('/detail/:id' , authenticate , (req,res) => {
    Faq.findById(req.params.id).exec((e,l)=>{
        if(e){
            handleError(res,e);
        }else{
            handleMessage(res,l);
        }
    });
});

faqRouter.put('/relateds' , authenticate , (req,res)=>{
    try {
        const body = _.pick(req.body ,['_id','related']);
        handleNullCollection(body , ['_id','related'] , (e)=>{
            if(e){
                handleError(res,e);
            }else{
                Faq.findById(body._id , async (e,obj)=>{
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
faqRouter.delete('/relateds/:id/:relid' , authenticate , (req,res)=>{
    Faq.findById(req.params.id , async (e,obj)=>{
        if(e){
            handleError(res,e);
        }else{
            obj.relateds.pull({
                _id : req.params.relid
            })
            await obj.save().then(()=>{
                handleMessage(res,obj);
            })
        }
    });
});
faqRouter.get('/relateds/:id' , authenticate , (req,res)=>{
    try {
        Faq.findById(req.params.id ).select('relateds').exec(async (e,obj)=>{
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
    faqRouter
};
