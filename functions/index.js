const functions = require('firebase-functions');

// Remember we are setting the passenger cloud function to send notification to driver

const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


exports.sendNewTripNotification = functions.firestore.document('drivers/{DriverUID}/NewRide/{passengerID}')
	.onWrite((snap, context) => {
		const uuid = context.params.DriverUID;
    	const passengerKey = context.params.passengerID

		

		var ref = admin.firestore().collection('drivers').doc(`${uuid}`).collection('NewRide').doc(`${passengerKey}`);
		return ref.get().then( function(value) {
			
			const location = value.data().location
			const id = value.data().Id
			const name = value.data().Name

			
			admin.firestore().collection('drivers').doc(`${uuid}`).get()
				.then((value) => {
				token = value.data().NotificationId
				const lat = location.latitude
				const long = location.longitude

				console.log(location)

				const payload = {
              	notification: {
                  	title: 'Pickup Available',
                 	body: 'Passenger Found'
              		},
              	data: {
                  	Name: name,
					ID: id,
					Lat: lat.toString(),
					Long: long.toString()
              		}
         	};
			console.log('Note String')
			 admin.messaging().sendToDevice(token, payload)
				})
			

				

			
			

			
		    },   function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
    			}
        );
	})