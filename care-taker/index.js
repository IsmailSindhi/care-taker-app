const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const User = require('./models/User');

const secret = 'secret110';
const PORT = 4000;

mongoose.connect('mongodb+srv://isoomro:isoomro@cluster0.stkwc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('connected', () => { console.log("Connected successfully") })
db.on('error', () => { console.log("Error in data base connection") });

const app = express();
app.use(cookieParser());
app.use(bodyParser.json({extended:true}));
app.use(cors({
  credentials:true,
  origin: 'http://localhost:3000',
}));

app.get('/', (req, res) => {
  res.send('ok');
});

app.get('/user', (req, res) => {
  const payload = jwt.verify(req.cookies.token, secret);
  User.findById(payload.id)
    .then(userInfo => {
      res.json({id:userInfo._id,email:userInfo.email});
    });

});

app.post('/register', (req, res) => {
  const {email,password,name,phoneNumber} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({email,name,phoneNumber,password:hashedPassword});
  user.save().then(userInfo => {
    jwt.sign({id:userInfo._id,email:userInfo.email}, secret, (err,token) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.cookie('token', token).json({id:userInfo._id,email:userInfo.email});
      }
    });
  });
});

app.post('/login', (req, res) => {
  const {email,password} = req.body;
  User.findOne({email})
    .then(userInfo => {
      const passOk = bcrypt.compareSync(password, userInfo.password);
      if (passOk) {
        jwt.sign({id:userInfo._id,email},secret, (err,token) => {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            res.cookie('token', token).json({id:userInfo._id,email:userInfo.email});
          }
        });
      } else {
        res.sendStatus(401);
      }
    })
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').send();
});

app.listen(4000);