process.env.NODE_CONFIG_DIR = __dirname + '/config';

const config = require('config');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
// const https = require('https');
const cors = require("cors")


const datetime = new Date();
const app = express();
const requestLogger = fs.createWriteStream(path.join(__dirname, `log/requests/${datetime.toISOString().slice(0,10)}.log`));
const {  logger } = require('./utils/winstonOptions');

const { userRouter } = require('./routes/userRoutes/userRoutes');
const { customerRouter } = require('./routes/userRoutes/customerRoutes');
const { categoryRouter } = require('./routes/blogRoutes/categoryRoutes');
const { contentRouter } = require('./routes/blogRoutes/contentRoutes');
const { aboutRouter } = require('./routes/infoRoutes/aboutRoutes');
const { slideRouter } = require('./routes/infoRoutes/slideRoutes');
const { faqRouter } = require('./routes/productRoutes/faqRoutes');
const { featureRouter } = require('./routes/productRoutes/featureRoutes');
const { groupRouter } = require('./routes/productRoutes/groupRoutes');
const { productRouter } = require('./routes/productRoutes/productRoutes');
const { uploadRouter } = require('./routes/uploadRoutes/uploadRoutes');
const { videoRouter } = require('./routes/videoRoutes/videoRoutes');



console.log(`*** ${String(config.get('Level')).toUpperCase()} ***`);
app.options('*', cors());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(express.json());
app.use(helmet());
app.use(morgan('combined',{stream: requestLogger}));

app.use('/api/users', userRouter);
app.use('/api/users/customers', customerRouter);
app.use('/api/blog/content', contentRouter);
app.use('/api/blog/category', categoryRouter);
app.use('/api/info/about', aboutRouter);
app.use('/api/info/slide', slideRouter);
app.use('/api/product/feature', featureRouter);
app.use('/api/product/group', groupRouter);
app.use('/api/product/faq', faqRouter);
app.use('/api/product', productRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/video', videoRouter);

app.get('/hello' , (req,res)=>{
    res.status(200).json({
        title : "hello"
    })
});

https
  .createServer(
    {
      cert: fs.readFileSync('/etc/letsencrypt/live/c1t.ir/fullchain.pem'),
      key: fs.readFileSync('/etc/letsencrypt/live/c1t.ir/privkey.pem')
    },
    app
  )
  .listen(config.get("PORT"), () => {
    console.log("Listening...");
  });