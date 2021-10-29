import express from 'express';
import cors from 'cors'
import mongoose from 'mongoose';
import Pusher from 'pusher';
import dbModel from './dbModel.js';

const app = express();
const port = process.env.PORT || 8080;

const pusher = new Pusher({
  appId: "1289150",
  key: "a4f0d2ddf72417c330bc",
  secret: "33c8ce64214e04f2f20e",
  cluster: "ap2",
  useTLS: true
});

app.use(express.json());
app.use(cors());

const connection_url='mongodb+srv://admin:An12ja34na56@cluster0.7zhyx.mongodb.net/fileDB?retryWrites=true&w=majority'


mongoose.connect(connection_url,{
    
    useNewUrlParser:true,
    useUnifiedTopology:true
})
mongoose.connection.once('open',()=>{
    console.log('DB Connected');
    const changeStream=mongoose.connection.collection('posts').watch()
    changeStream.on('change',(change)=>{
        console.log('ChgStream Triggered on pusher...')
        console.log(change);
        console.log('End of Change');
        if(change.operationType==='insert'){
            console.log('Triggering Pusher ***IMG UPLOAD');
            const postDetails=change.fullDocument;
            pusher.trigger('posts','inserted',{
                user:postDetails.user,
                image:postDetails.image
            })
        }else{
            console.log('Unknown trigger from Pusher');
        }
    })
});
  


app.get("/", (req, res) => res.status(200).send("hello world"));


app.post("/upload",(req,res)=>{
  const body=req.body;
  dbModel.create(body,(err,data)=>{
      if(err){
          res.status(500).send(err);
      }else{
          res.status(201).send(data);
      }
  });

});
app.get('/sync',(req,res)=>{
    dbModel.find((err,data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(data);
        }
    })
})



app.listen(port, () => console.log(`listening on localhost:${port}`));
