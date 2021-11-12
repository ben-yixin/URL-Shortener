require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')
const dns = require('dns')
var bodyParser = require("body-parser")
// Basic Configuration
const port = process.env.PORT || 3000;
let uri = process.env.MONGO_URI;
mongoose.connect(uri ,{useNewUrlParser:true,useUnifiedTopology: true});

const websiteSchema = new mongoose.Schema({
  url: {type: String, required: true, unique: true},
  short: {type: Number, unique: true}
})

const Website = mongoose.model('Website', websiteSchema);


app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const createWebsite = (url, short) =>{
  Website.create({ url: url, short: short }, 
  (err,data)=>{
    console.log(data)
    if(err) console.log(err);
  })
}

app.post('/api/shorturl', (req, res)=>{
  const url = req.body.url;
  console.log(url)
  let short = 1;
  let regex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'gi');
  console.log(regex.test(url))
  console.log(url.match(regex))
  if(regex.test(url)){
    /*Check for highest short value*/
  Website.findOne({}).sort({short: 'desc'})
  .exec((err, data)=>{
    if(!err && data != undefined){
      short = data.short + 1;
      createWebsite(url, short);
      res.json({ original_url: url, short_url: short});
    } else if(data == undefined){
      createWebsite(url, short);
      res.json({ original_url: url, short_url: short});
    }
  })
  } else {
    res.json({error: 'invalid url'})
  }
  
})

app.get('/api/shorturl/:num',(req,res)=>{
  const num = req.params.num;
  Website.findOne({short: num}, (err,data) => {
    console.log(data.url)
    if(!err){
      console.log("Redirecting...")
      res.redirect(data.url)
    } else{
      console.log("ERROR:")
      console.log(err)
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
