import { db } from "./MyFirebase";
import RNFetchBlob from 'rn-fetch-blob';
import { AsyncStorage } from "react-native"
/**
 
static setUserName(userId, Name) {

    let userName = "/user/" + userId + "/details";

    return db.database().ref(userName).set({
        Name: Name
    })

}
 */

export const saveImage = (key, uri) => {

    let dbStorage = db.storage()
    const PhotoUrl = ''

    const image = uri

    const Blob = RNFetchBlob.polyfill.Blob
    const fs = RNFetchBlob.fs
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
    window.Blob = Blob

    let uploadBlob = null


    var firebaseStorageRef = dbStorage.ref(key);
    const imageRef = firebaseStorageRef.child("ProfilePic");
    let mime = 'image/jpg'

    fs.readFile(image, 'base64')
        .then((data) => {
            return Blob.build(data, { type: `${mime};BASE64` })
        })
        .then((blob) => {
            console.log(blob)
            console.log("Drwa")
            uploadBlob = blob
            return imageRef.put(blob, { contentType: mime })
        })
        .then(() => {
            uploadBlob.close()
            return imageRef.getDownloadURL()
        })
        .then((url) => {
            // URL of the image uploaded on Firebase storage
            console.log(url);
            AsyncStorage.setItem('PhotoUrl', url)
                .catch((error) => { console.log(error) })
            return (url);

        })
        .catch((error) => {
            console.log(error);

        })
    return (PhotoUrl)
}

export const listen4Drivers = () => {

    db.database().ref('drivers').once('value', (snap) => {
        var drivers = [];
        snap.forEach((child) => {

            drivers.push({
                latitude: child.val().latitude,
                longitude: child.val().longitude,


            });
        });
        console.log(drivers)
        return (drivers);

    });
}

export const listenUserName = (userId, callback) => {

    let userName = "/user/" + userId + "/details";

    db.database().ref(userName).on('value', (snapshot) => {

        var Name = "";



        if (snapshot.val()) {

            Name = snapshot.val().Name

        }

        callback(Name)
    });
}



