const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smartbrain-c6495.firebaseio.com"
});

const db = admin.firestore();

module.exports = {admin,db}