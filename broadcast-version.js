const admin = require('firebase-admin');
const path = require('path');
const cert = require(path.join(__dirname, 'firebase-admin.cert.json'));
const version = require(path.join(__dirname, 'package.json')).version;

admin.initializeApp({
  credential: admin.credential.cert(cert),
  databaseURL: "https://dayley-ffc3c.firebaseio.com"
});

admin.database().ref(`latestVersion`).set(version)
.then(() => console.log('Version broadcasted.'))
.catch(console.error)
.finally(() => process.exit());
