const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require('cors');

const firebase = require("firebase");
const { admin, db } = require("./util/db");

const firebaseConfig = {
  apiKey: "AIzaSyDvjfAEpP6OgCNlrwj-bKHfXRwPcT7-u4k",
  authDomain: "smartbrain-c6495.firebaseapp.com",
  databaseURL: "https://smartbrain-c6495.firebaseio.com",
  projectId: "smartbrain-c6495",
  storageBucket: "smartbrain-c6495.appspot.com",
  messagingSenderId: "186675392374",
  appId: "1:186675392374:web:d945dc8c43b9febab51457"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Auth")
  ) {
    idToken = req.headers.authorization.split(" ")[1];
  } else {
    console.error("no Token found");
    return res.status(403).json({ error: "Unauthorized" });
  }
  //console.log(idToken)

  admin.auth().verifyIdToken(idToken)
  .then(decodedToken =>{
    return db.doc(`user/${decodedToken.uid}`).get()
  })
  .then(doc =>{
    if(!doc.exists){
      res.status(400).json('login')
    }else{
      res.status(200).json({
        name:doc.data().name,
        email:doc.data().email,
        entry:doc.data().entry
      })
    }
  })
  .catch(err => console.log(err))
});

app.post("/signin", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      res.status(200).json({token});
    })
    .catch(err => {
      console.log(err.code)
      if(err.code === 'auth/user-not-found'){
        res.json({error:'incorrect email'});  
      }else if(err.code === 'auth/wrong-password'){
        res.json({error:'incorrect Password'});  
      }else{
        res.json(err.code)
      }
      
    });
});

app.post("/register", (req, res) => {
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    entry: 0
  };

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      let dbRef = db.doc(`user/${data.user.uid}`);
      dbRef
        .set({
          id: data.user.uid,
          name: newUser.name,
          email: newUser.email,
          entry: newUser.entry
        })
        .then(() => res.status(201).json("user Created"))
        .catch(err => res.status(400).json(err.code));
    })
    .catch(err => res.status(400).json(err.code));
});


app.post("/updateEntry", (req, res) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Auth")
  ) {
    idToken = req.headers.authorization.split(" ")[1];
  } else {
    console.error("no Token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin.auth().verifyIdToken(idToken)
    .then(decodedToken =>{
      return db.doc(`user/${decodedToken.uid}`).get()
    })
    .then(doc =>{
      if(!doc.exists){
       return res.status(400).json('user not found');
      }else{
        return doc.ref.update({entry:doc.data().entry + 1})
      }
    })
    .then(response=>{
      console.log(response)
    })
    .catch(err => console.log(err))
});


app.listen(3001, () => {
  console.log("app is running on port 3001");
});
