import React, { Component } from 'react';

import {

    StyleSheet,
    AsyncStorage,
    Text,
    View,
    Dimensions,
    Alert,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import geofire from 'geofire';
import { GeoFirestore } from 'geofirestore';
import firebase from 'react-native-firebase';
import RNGooglePlaces from 'react-native-google-places';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Container, Icon, Left, Header, Body, Right } from 'native-base';
import Swiper from 'react-native-swiper';
import { Button } from 'react-native-elements';
import { db } from "../../config/MyFirebase";
import Spinner from 'react-native-spinkit';
import SlidingPanel from 'react-native-sliding-up-down-panels';

const { width, height } = Dimensions.get('window');





export default class ConnectingDriver extends Component {
    static navigationOptions = { header: null }
    constructor(props) {
        super(props);
        this.state = {
            Name: this.props.navigation.state.params.Name,
            origin: this.props.navigation.state.params.origin,
            driverFound: false,
            driverId: this.props.navigation.state.params.driverId,
            driverName: this.props.navigation.state.params.driverName,
            driversLocation: null,
            isMapReady: false,
            DriverPhotoUrl: null,
            error: null

        }

        // Get Your Location From AsyncStorage

        AsyncStorage.getItem('MyLocation')
            .then(value => {
                if (value == null) {
                    return;
                }
                else {
                    const item = JSON.parse(value);
                    console.log(item)
                    this.setState({ origin: item })
                }

            })
            .catch(err => console.log(err))


        navigator.geolocation.getCurrentPosition(
            (position) => {

                this.setState({
                    origin: { latitude: position.coords.latitude, longitude: position.coords.longitude },


                });

            },
            (error) => {

                Alert.alert(error.message)
            },
            { enableHighAccuracy: true, timeout: 20000 },
        );


        // Recursive function to get ClosestDriver




        // It Now Has to Listen On his ride_request to see if there is a change

        /*let user = db.auth().currentUser;

        db.database().ref('DriversAvailable').on('value', (snapshot) => {





            if (snapshot.val().status == "confirmed") {

                // If status of your ride is confirmed, get driver PayLoad
                let driverPayLoad = snapshot.val().accepted_by
                this.setState({ driver: driverPayLoad })

            }


        });*/
    }

    driverLocation = (key) => {
        driverRef = db.database().ref('DriversWorking').child(key)

    }

    onCancel = (key) => {
        console.log(key)
        
        dataBase = firebase.firestore()

        AsyncStorage.multiRemove(['driverID', 'driverName', 'MyLocation']);
        let user = firebase.auth().currentUser;

        // Delete passenger collection child from drivers Collection
        const driverRef = dataBase.collection('drivers').doc(key)
        driverRef.collection("NewRide").doc(user.uid).delete()

        // Update status of Ride-History to cancelled

        let ride = dataBase.collection("ride-request").doc(user.uid)
        ride.delete()

        // U also Need to remove RideStatus Too


        //We need to stop the listener before removing the child else it will result in an error
        

        

        // Check if ride has already been accepted by driver in this.state
        // If accepted by driver, store cancelled ride with charges due
        // else 
        // store  ordinary cancelled rides for this user in database
        //...
        // Navigate to Home Screen After Cancelling Ride
        this.props.navigation.navigate("Main")
    }

    //Listen for Drivers Location on Firestore

    listenDriver(key, userID) {
        console.log('Listening')
        console.log(key)
        console.log(userID)
        

        // Later we can remove this function because GettingDriver will update
        // DriverPhoto and if customer has already booked driver before, we can
        // also send as param from Home.js the url just as we sent driverId from
        // Home.js that was stored in with async
        this.Photo(key)

        dataBase = firebase.firestore()
        const GeoRef = new GeoFirestore(dataBase)

        let myRef = dataBase.collection('ride-request').doc(userID)
        // We should Know that if 'DriverWorking has not been created by driver, this listener will throw an error
        
        const geofirestoreRef = GeoRef.collection('DriversWorking').doc(key)

        var unsubscribe = myRef.collection('RideStatus').doc(userID).onSnapshot( (snap) => {
            //When driver cancels, set state which forces re-ender
            // Call this.GettingDriver()
            console.log(snap)
            
            if (snap.data().status == 'cancelled') {
                console.log("cancelled by driver")
                // We should see if we can remove driverID details from Async
                // Incase Driver has already accepted ride before he cancels
                // Remember we only set Async when driver accepts ride
                this.setState({ driverFound: false })

                //Unsubscribe Listener on RideStatus in Firestore
                unsubscribe();
                this.GettingDriver()
            }

            if (snap.data().status == 'accepted') {
                console.log("Got accepted")
                this.setState({status: 'accepted'})
                //Store Driver Details on Async Only if Driver has accepted
                AsyncStorage.multiSet([['driverID', key], ['driverName', this.state.driverName], ['DriverPhotoUrl', this.state.DriverPhotoUrl]])


                //Use Geofire to Track Location of Driver and Update driversLocation State
                geofirestoreRef.onSnapshot((val) => {
                    
                    const location = val.data().coordinates
                    const lat = location.latitude
                    const long = location.longitude
                    
                    const loc = [lat, long]

                    console.log('Print New Location')
                    console.log(loc)

                    this.setState({ driversLocation: loc, 
                        driverFound: true })
                    
                })


            }
            console.log('Ride status has not changed')

        })

        // Stop Listening for status of Ride in Firstore
        
    {/*Dave ?*/}

    // Listen Drivers Location or If Driver Cancels
    {/*
        
        listenDriver(key, userID) {
        console.log('Listening')
        console.log(userID)

        // Later we can remove this function because GettingDriver will update
        // DriverPhoto and if customer has already booked driver before, we can
        // also send as param from Home.js the url just as we sent driverId from
        // Home.js that was stored in with async
        this.Photo(key)

        let myRef = db.database().ref('ride-request').child(userID)
        // We should Know that if 'DriverWorking has not been created by driver, this listener will throw an error
        let driverRef = db.database().ref('DriversWorking')
        const geofireRef = new geofire(driverRef)
        myRef.on('value', (snap) => {
            //When driver cancels, set state which forces re-ender
            // Call this.GettingDriver()
            if (snap.val().status == 'cancelled') {
                console.log("cancelled by driver")
                // We should see if we can remove driverID details from Async
                // Incase Driver has already accepted ride before he cancels
                // Remember we only set Async when driver accepts ride
                this.setState({ driverFound: false })
                myRef.off('value');
                this.GettingDriver()
            }

            if (snap.val().status == 'accepted') {
                console.log("Got accepted")
                //Store Driver Details on Async Only if Driver has accepted
                AsyncStorage.multiSet([['driverID', key], ['driverName', this.state.driverName], ['DriverPhotoUrl', this.state.DriverPhotoUrl]])


                //Use Geofire to Track Location of Driver and Update driversLocation State
                geofireRef.get(key)
                    .then((location) => {
                        this.setState({ driversLocation: location, driverFound: true })

                    })

            }

        })
    }
    */}
    }

    GettingDriver() {
        let radius = 50
        const { driverFound, driverId } = this.state;
        let user = firebase.auth().currentUser;
        // We have to ensure status of ride-request of passenger is pending if
        // driver cancels ride and this function is called again.
        // Normally if ride-request of passenger remains cancelled, the listener
        // will keep calling this function

        dataBase = firebase.firestore()
        
        let myRef = dataBase.collection('ride-request').doc(user.uid)
        
        myRef.collection('RideStatus').doc(user.uid).update({ status: 'pending' })
        console.log('In getting Ride')
        
        

        getClosestDriver = () => {
            console.log('Another Geosettings')
            
            
            //const driverRef = dataBase.collection('DriversAvailable')
            //const geofireRef = new GeoFirestore(driverRef)

            //Try another pattern
            const geoFirestore = new GeoFirestore(dataBase);
            const geoCollectionRef = geoFirestore.collection('DriversAvailable');
            console.log('What is the geofirestore')
            const Geoquery = geoCollectionRef.near({
                center: new firebase.firestore.GeoPoint(this.state.origin.latitude, this.state.origin.longitude),
                radius: radius
            })

            console.log('Start the geo Now')
            Geoquery.limit(1).get().then((value) => {
                console.log(value)      // This is GeoquerySnapshot
                console.log('Has gotten')
                console.log(value.docs[0].id); // All docs returned by GeoQuery
                driverKey = value.docs[0].id
                console.log(driverKey)
                const driverRef = dataBase.collection('drivers').doc(driverKey)

                
                driverRef.get()
                .then((doc) => {
                    console.log(doc.data().Name)
                    this.setState({driverName: doc.data().Name})
                        // Store driverName and driverID
                        //AsyncStorage.multiSet([['driverID', key], ['driverName', this.state.driverName]])
                    })
                this.Photo(driverKey) // Updating DriverPhotoUrl to display Driver Pic


                GeoDocRef = geoFirestore.collection('DriversAvailable').doc(driverKey);
                console.log(GeoDocRef)
                GeoDocRef.get()
                .then((value) => {
                    const location = value.get('coordinates')
                    const lat = location.latitude
                    const long = location.longitude
                    
                    const loc = [lat, long]
                    this.setState({
                        driverFound: true,
                        driverId: driverKey,
                        driversLocation: loc
                    })
                })

                // Inform Driver Of New Ride by adding passenger Id as a child
                console.log('set drive')
                driverRef.collection("NewRide").doc(user.uid).set({Id: user.uid, location: this.state.origin, Name: this.state.Name })
                console.log('statussss')
                    
                    //Now call function to listen if driver cancels
            this.listenDriver(driverKey, user.uid)
            });



            
                    //Get the Name of the Driver
            
                        
                        
                    

                    // Sending Notification to Driver using Driver ID key

                   {/* driverRef.child(user.uid).update({
                        location: location,
                        Name: 'Blaizet', //We will have to use user.Name later
                        status: 'pending'
                    })
                   */}

            
        }
        getClosestDriver();
                
{/*
    GettingDriver() {
        let radius = 1
        const { driverFound } = this.state;
        let user = firebase.auth().currentUser;
        // We have to ensure status of ride-request of passenger is pending if
        // driver cancels ride and this function is called again.
        // Normally if ride-request of passenger remains cancelled, the listener
        // will keep calling this function
        let myRef = db.database().ref('ride-request').child(user.uid)
        myRef.update({ status: 'pending' })

        getClosestDriver = () => {

            driverRef = db.database().ref('DriversAvaliable')
            const geofireRef = new geofire(driverRef)
            const Geoquery = geofireRef.query({
                center: [this.state.origin.latitude, this.state.origin.longitude],
                radius: radius
            })



            Geoquery.on("key_entered", (key, location) => {
                console.log(location);
                if (!driverFound) {

                    console.log("Got This Driver")
                    console.log(this.state.driversLocation)
                    //Get the Name of the Driver
                    driverRef = db.database().ref('drivers').child(key)
                    driverRef.once('value', (snap) => {
                        this.setState({ driverName: snap.val().Name })
                        // Store driverName and driverID
                        //AsyncStorage.multiSet([['driverID', key], ['driverName', this.state.driverName]])
                    })

                    // Sending Notification to Driver using Driver ID key

                    driverRef.child(user.uid).update({
                        location: location,
                        Name: 'Blaizet', //We will have to use user.Name later
                        status: 'pending'
                    })


                    this.Photo(key) // Updating DriverPhotoUrl to display Driver Pic

                    this.setState({
                        driverFound: true,
                        driverId: key,
                        driversLocation: location
                    })
                    //Now call function to listen if driver cancels

                }

                Geoquery.cancel();
                this.listenDriver(key, user.uid)

            })

            Geoquery.on("ready", function () {
                if (!driverFound) {
                    radius++;
                    getClosestDriver();
                }

            })
        }
        getClosestDriver();
    }
        */}
                
        }
        
        
    

    



    componentDidMount() {
        let user = firebase.auth().currentUser;
        if (!this.state.driverId) {
            this.GettingDriver();
        }


        if (this.state.driverId) {

            console.log('There is driver Id available')
            console.log(this.state.driverId)
            console.log(this.state.origin)

            this.listenDriver(this.state.driverId, user.uid)
        }


    }

    onMapLayout = () => {
        console.log("Map LayOut Ready")
        this.setState({ isMapReady: true });
    }

    Photo(key) {
        let dbStorage = db.storage()
        const { DriverPhotoUrl } = this.state;

        var firebaseStorageRef = dbStorage.ref('Drivers');

        const imageRef = firebaseStorageRef.child(key).child('IMG_0391.JPG');
        const mike = imageRef.getDownloadURL()
        mike.then((url) => {
            console.log(url)
            this.setState({ DriverPhotoUrl: url })
            //this.setState({ error: "Badd" })

        });
        {/*.then(
                (url) => {
                    console.log(url)
                    if (url == null) {
                        return
                    }
                    else {
                        this.setState({ DriverPhotoUrl: url })
                        console.log("Yesssss it is available")
                        return
                    }
                }
            )*/}
        return (DriverPhotoUrl)
    }


    renderDefaultImage(key) {
        const { DriverPhotoUrl } = this.state;

        if (DriverPhotoUrl == null) {

            console.log('No Driver Photo')
            return (
                <Image style={styles.driverImage}
                    source={require('../images/user.png')} />
            )
        }

        else {


            return (
                <Image style={styles.driverImage}
                    source={{ uri: DriverPhotoUrl }} />
            )

        }
    }



    render() {
        const { driverFound, origin, driversLocation, driverId } = this.state;
        const GOOGLE_MAPS_APIKEY = 'AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk';


        if (!driverFound) {
            return (
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0, 0.9)',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Spinner
                        style={{
                            marginBottom: 50
                        }}
                        isVisible={true}
                        size={150}
                        type={'Bounce'}
                        color={'#faebd7'}

                    />
                </View>
            );

            /*return (
                <View>
                    <ActivityIndicator size='small' color="#00ff00" />
                </View>
            );*/
        }
        return (

            <View style={styles.container}>
                {/*MapView Must always be Wrapped in a Container else it wont show*/}
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={{
                        latitude: origin.latitude,
                        longitude: origin.longitude,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                    showsUserLocation={true}
                    onLayout={this.onMapLayout}
                >
                    <MapView.Marker coordinate={origin} />
                    {
                        this.state.driversLocation ?
                            (
                                <MapView.Marker
                                    title='Driver'
                                    coordinate={{ latitude: this.state.driversLocation[0], longitude: this.state.driversLocation[1] }} />

                            )
                            :
                            (
                                null
                            )

                    }
                    <MapViewDirections
                        origin={origin}
                        destination={{ latitude: this.state.driversLocation[0], longitude: this.state.driversLocation[1] }}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={3}
                        strokeColor="hotpink"
                    />

                </MapView>


                <SlidingPanel
                    headerLayoutHeight={100}
                    headerLayout={() =>
                        <View style={styles.headerLayoutStyle}>
                            {this.renderDefaultImage(driverId)}
                            <Text style={styles.driverTextStyle}>{this.state.driverName}</Text>
                        </View>
                    }
                    slidingPanelLayout={() =>
                        <View style={styles.slidingPanelLayoutStyle}>
                            <Text style={styles.commonTextStyle}>Drivers Location{this.state.driversLocation}</Text>
                            <Text style={styles.commonTextStyle}>Drivers ID {this.state.driverId}</Text>
                            <Button
                                buttonStyle={{ marginTop: 20 }}
                                backgroundColor="#03A9F4"
                                title="Cancel Ride"
                                onPress={() => this.onCancel(this.state.driverId)}
                            />
                        </View>
                    }
                />
            </View>
        )

    }
}

const styles = StyleSheet.create({
    map: { ...StyleSheet.absoluteFillObject },
    container: {
        flex: 1,
    },
    bodyViewStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    driverImage: {
        width: 95,
        height: 95,
        borderRadius: 75
    },
    headerLayoutStyle: {
        width,
        height: 100,
        backgroundColor: 'rgba(0,0,0, 0.9)',
        justifyContent: 'space-evenly',
        //alignItems: 'center',
        flexDirection: 'row',
    },
    slidingPanelLayoutStyle: {
        width,
        height,
        backgroundColor: '#808080',
        justifyContent: 'center',
        alignItems: 'center',
    },
    commonTextStyle: {
        color: 'white',
        fontSize: 18,
    },
    driverTextStyle: {
        color: 'white',
        fontSize: 18,
        marginTop: 30,
    },
});
