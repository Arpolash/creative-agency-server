const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;

const port = 5000


app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sjfoa.mongodb.net/${process.env.DB_NAME}retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology : true });

app.get('/', (req, res) => {
    res.send('hello');

})

client.connect(err => {
    const agencyCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION}`);
    const userCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION2}`);

    app.get('/ourAllCourse',(req,res) =>{
        agencyCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.get('/ourCourse',(req,res) =>{
        const name = "Mobile & Web Design";
        agencyCollection.find({name : name})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.post('/addUserInfo', (req,res) =>{
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        console.log(file,name,email)
        file.mv(`${__dirname}/doctors/${file.name}`, err =>{
          if(err){
            console.log(err);
            return res.status(500).send({msg : 'Failed to upload img'});
          }
          userCollection.insertOne({ name, email, img:file.name })
          .then(result => {
              res.send(result.insertedCount > 0);
          })
        })
      })

  });



app.listen(port)