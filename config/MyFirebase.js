import Firebase from 'firebase';

let config = {
    apiKey: "AIzaSyCXZiERpF2DscCApxbRca9Y7UtglIdc-G8",
    authDomain: "alpharides-f115c.firebaseapp.com",
    databaseURL: "https://alpharides-f115c.firebaseio.com/",
    projectId: "alpharides-f115c",
    storageBucket: "alpharides-f115c.appspot.com",
    messagingSenderId: "38995523207"
};


export const db = Firebase.initializeApp(config);