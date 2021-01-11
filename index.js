const express = require('express')
const port = 6000
const MongoClient = require('mongodb').MongoClient;

const bodyParser = require('body-parser');
var cors = require('cors')
var admin = require('firebase-admin');
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y8hyt.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(bodyParser.json())
app.use(cors())




var serviceAccount = require("./confiqs/burj-al-arab-firebase-firebase-adminsdk-4svap-128bd56aea.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});


app.get('/', (req, res) => {
  res.send('Hello burj al arab!')
})



client.connect(err => {
  const bookingCollection = client.db("burjAlArab").collection("booking");
  // perform actions on the collection object
    app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    //console.log(newBooking);
    bookingCollection.insertOne(newBooking)
    .then(result => {
        //console.log(result);
        res.send(res.insertedCount > 0)
    })
})

app.get('/bookings', (req, res) => {
    //console.log(req.headers.authorization)

      const bearer = req.headers.authorization;
      if (bearer && bearer.startsWith('Bearer ')) {
        const idToken = bearer.split(' ')[1];
        console.log({idToken})
        // idToken comes from the client app
        admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
          let tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          console.log(tokenEmail, queryEmail);
          if (tokenEmail == req.query.email) {
              bookingCollection.find({email: req.query.email})
              .toArray((err, documents) => {
                  res.send(documents)
              })
          }
          else{
            res.status(401).send('unauthorized access')
          }
          // ...
        }).catch(function(error) {
          // Handle error
          res.status(401).send('unauthorized access')
        });       
      }
      else{
        res.status(401).send('unauthorized access')
      }
})

  
});


app.listen(process.env.PORT || port)


 