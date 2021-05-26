const express = require('express');
const _ = require('lodash');
const { access }  = require('../../middleware/access');
const { publicAuth }  = require('../../middleware/publicAuth');
const {About} = require('../../model/info/about');
const {
    handleError,
    handleMessage,
    handleNullCollection
} = require('../../utils/utils');

const aboutRouter = express.Router();

aboutRouter.post('/' , access ,  (req,res)=>{
    try {
        const body = _.pick(req.body ,['title','subtitle','url','location','locationLink','tags','email','phones','time','telegram','whatsapp','instagram' , 'logo','aboutImg','about']);
        handleNullCollection(body , ['title','subtitle','url','location','locationLink','tags','email','phones','time','telegram','whatsapp','instagram' , 'logo' ,'aboutImg','about'] , async(e)=>{
            if(e){
                handleError(res,e);
            }else {
                About.findOne({}, async(e,a)=>{
                    if(e){
                        handleError(res,e);
                    }else {
                        if(!a){
                            let about = new About(Object.assign({
                                userId : req.user._id
                            },body));
                            await about.save().then(()=>{
                                handleMessage(res,about);
                            });
                        }else {
                            a.title = body.title;
                            a.subtitle = body.subtitle;
                            a.url = body.url;
                            a.location = body.location;
                            a.locationLink = body.locationLink;
                            a.tags = body.tags;
                            a.email = body.email;
                            a.phones = body.phones;
                            a.time = body.time;
                            a.telegram = body.telegram;
                            a.whatsapp = body.whatsapp;
                            a.instagram = body.instagram;
                            a.logo = body.logo;
                            a.about = body.about;
                            a.aboutImg = body.aboutImg;
                            a.userId = req.user._id
                            await a.save().then(()=>{
                                handleMessage(res,'');
                            });
                        }
                    }
                });
            }
        });
    } catch (e) {
        handleError(res,e);
    }
});
aboutRouter.get('/' , access , (req,res)=>{
    try {
        About.findOne({}).exec((e,r)=>{
            if(e){
                handleError(res,e);
            }else{
                handleMessage(res,r);
            }
        });
    }catch (e) {
        handleError(res,e);
    }
});
aboutRouter.get('/info' , publicAuth , (req,res)=>{
    try {
        About.findOne({}).exec((e,r)=>{
            if(e){
                handleError(res,e);
            }else{
                handleMessage(res,r);
            }
        });
    }catch (e) {
        handleError(res,e);
    }
});

module.exports = {
    aboutRouter
};