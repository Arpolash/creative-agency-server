const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
require('dotenv').config();

const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sjfoa.mongodb.net/${process.env.DB_NAME}retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology : true });



const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('doctors'))
app.use(fileUpload())


app.get('/', (req, res) => {
    res.send('hello');

})

client.connect(err => {
    const userCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION2}`);
    const reviewCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION3}`);
    const serviceCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION4}`);
    const adminCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION5}`);

    app.post("/addUser", (req, res) => {
        const user = req.body;
        userCollection.insertOne(user)
        .then(result => {
          res.redirect('https://creative-agency-197d4.web.app/dashboard/service')
        })
      })

      app.get('/allStudent',(req,res) =>{
        userCollection.find({})
        .toArray((err,document) =>{
          res.send(document);
        })
      })

      app.get('/userServiceList',(req,res) =>{
        userCollection.find({email : req.query.email})
        .toArray((err,document) =>{
            
          res.send(document);
        })
      })

      app.post('/addReview', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const title = req.body.title;
        const text = req.body.text;
  
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };

        reviewCollection.insertOne({ name, title,text, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/review', (req, res) => {
      reviewCollection.find({}).sort({ _id: -1}).limit(3)
          .toArray((err, documents) => {
              res.send(documents);
          })
  });


  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const text = req.body.text;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer.from(encImg, 'base64')
    };

    serviceCollection.insertOne({ title,text, image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })
    app.get('/service', (req, res) => {
        serviceCollection.find({}).sort({ _id: -1}).limit(3)
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post("/addAdmin", (req, res) => {
      const user = req.body;
      adminCollection.insertOne(user)
      .then(result => {
        res.redirect('https://creative-agency-197d4.web.app/admin/makeAdmin')   
      })
    })

    app.post('/isAdmin', (req, res) => {
      const email = req.body.email;
      adminCollection.find({email: email })
          .toArray((err, document) => {
              res.send(document.length > 0) 
          })
     })

  });



  app.listen(process.env.PORT || port)
