import React, { Component } from 'react';

import {

    StyleSheet,
    AsyncStorage,
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import geofire from 'geofire';
import firebase from 'react-native-firebase';
import RNGooglePlaces from 'react-native-google-places';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Container, Icon, Left, Header, Body, Right } from 'native-base';
import Swiper from 'react-native-swiper';
import { db } from "../../config/MyFirebase";
import { Button } from 'react-native-elements';
import Spinner from 'react-native-spinkit';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default class BookRide extends Component {
    static navigationOptions = { header: null }
    constructor(props) {
        super(props);
        this.state = {
            Name: '',
            destination: this.props.navigation.state.params.placeID,
            isPlaceID: true,
            error: '',
            gettingMyLocation: true,
            origin: { latitude: 5.5544, longitude: 5.7932 },
            concatOrigin: "",
            concatDest: "",
            carPrice: 0.00,
            autoPrice: 0.00,
            duration: '',
            distance: 0.0,
            BookedRide: false,
            NewDestination: null,
            done: false

        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    origin: { latitude: position.coords.latitude, longitude: position.coords.longitude },
                    error: null,
                    gettingMyLocation: false
                });

            },
            (error) => this.setState({ error: error.message }),
            { enableHighAccuracy: true, timeout: 20000 },
        );

        RNGooglePlaces.lookUpPlaceByID(this.state.destination)
            .then((result) => {
                this.setState({
                    NewDestination: { latitude: result.latitude, longitude: result.longitude },

                })
            })
            .then(() => {
                let origin = this.state.origin
                let destination = this.state.NewDestination
                let API_KEY = 'AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk'
                this.mergeLot(origin, destination);

                fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${this.state.concatOrigin}&destinations=${this.state.concatDest}&key=${API_KEY}`)
                    .then(response =>
                        response.json())
                    .then(responseJson => {
                        // After getting the distanceMatrix, we will now use it
                        // to calculate the fare and then set price for auto and
                        // car and then set duration and distance too

                        console.log(responseJson)


                        // Temporarily set state so map will show because unpaid distance matrix api will give an error
                        this.setState({ done: true })
                        let dsKm = responseJson.rows[0].elements[0].distance.text
                        let dsM = responseJson.rows[0].elements[0].distance.value
                        let duration = responseJson.rows[0].elements[0].duration.text
                        let CarPricePerMetre = 0.12065637
                        let AutoPricePerMetre = 0.07239382

                        let CarPrice = Math.round(CarPricePerMetre * dsM)
                        let AutoPrice = Math.round(AutoPricePerMetre * dsM)

                        console.log(dsKm);

                        // Setting state will only work here if the above doesnt give an error
                        this.setState({
                            duration: duration,
                            distance: dsKm,
                            done: true,
                            isPlaceID: false,
                            gettingMyLocation: false,
                            carPrice: CarPrice,
                            autoPrice: AutoPrice
                        })


                    })
                    .catch(error => console.log(error))
            })



    }

    mergeLot = (origin, destination) => {

        let concatOrigin = origin.latitude + "," + origin.longitude
        let concatDest = destination.latitude + "," + destination.longitude
        this.setState({
            concatOrigin: concatOrigin,
            concatDest: concatDest
        });
    }

    onBookRide = (type, price) => {
        const { origin, Name } = this.state
        let user = firebase.auth().currentUser;
        this.setState({ BookedRide: true })

        
        // Lets try to set Firestore Ref to store User location
        dataBase = firebase.firestore()

        //Temporarily Set DriversAvailable and DriversWorking GeoPoints

        
        // U can decide to Use GeofireStore to set the location
        
        let requestDriver = dataBase.collection('ride-request').doc(user.uid)
        requestDriver.set({location: new firebase.firestore.GeoPoint(this.state.origin.latitude, this.state.origin.longitude)})
        .then(() => {
            requestDriver.update({
                currentUser: user.uid,
                    destination: this.state.NewDestination,
                    type: type,
                    Fare: price,
                    duration: this.state.duration,
                    distance: this.state.distance,
                    accepted_by: null
            })
            requestDriver.collection('RideStatus').doc(user.uid).set({status: 'pending'})

        })
        .then(() => {
            const originObj = JSON.stringify(origin)
                AsyncStorage.setItem('MyLocation', originObj)
                    .catch(err => {
                        console.log("Unable to store Location")
                        console.log(err)
                    });

                
                this.props.navigation.navigate("ConnectingDriver", { origin, Name });


        })



        //Submit passenger PayLoad to Ride-Requests.
        
        {/*
        let requestDriver = db.database().ref('/ride-request')
        let RideHistoryRef = db.database().ref('/ride-history')
        const geofireRef = new geofire(requestDriver)
        geofireRef.set(user.uid, [this.state.origin.latitude, this.state.origin.longitude])
            .then(() => {

                requestDriver.child(user.uid).update({
                    currentUser: user.uid,
                    destination: this.state.NewDestination,
                    type: type,
                    Fare: price,
                    duration: this.state.duration,
                    distance: this.state.distance,
                    status: 'pending',
                    accepted_by: null

                })




            })

            .then(() => {
                console.log('Hello')
                RideHistoryRef.child(user.uid).push().update({
                    currentUser: user.uid,
                    destination: this.state.NewDestination,
                    type: type,
                    Fare: price,
                    duration: this.state.duration,
                    distance: this.state.distance,
                    status: 'pending',
                    accepted_by: null

                })
                // Store Origin coordinates via AsyncStorage
                const originObj = JSON.stringify(origin)
                AsyncStorage.setItem('MyLocation', originObj)
                    .catch(err => {
                        console.log("Unable to store Loacation")
                        console.log(err)
                    });


                this.props.navigation.navigate("ConnectingDriver", { origin });
            })
        */}


    }




    componentDidMount() {
        AsyncStorage.getItem('Name')
        .then(res => {
            this.setState({
                Name: res
            })
        })

    }
    render() {
        const { origin, destination } = this.state;
        const GOOGLE_MAPS_APIKEY = 'AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk';

        // This below happens only when the user clicks book ride
        if (this.state.BookedRide) {
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

        if (!this.state.done) {
            console.log(this.state.done);
            console.log("Itel on BookRide");

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
        }



        return (
            <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={{ height: hp('50%') }}>
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
                    >

                        <MapView.Marker coordinate={origin} />
                        {
                            this.state.NewDestination ?
                                (
                                    <MapView.Marker
                                        title='Driver'
                                        coordinate={this.state.NewDestination} />

                                )
                                :
                                (
                                    null
                                )

                        }
                        <MapViewDirections
                            origin={origin}
                            destination={this.state.NewDestination}
                            apikey={GOOGLE_MAPS_APIKEY}
                            strokeWidth={3}
                            strokeColor="hotpink"
                        />
                    </MapView>
                </View>
                <View style={{ height: hp('50%') }}>
                    <Swiper style={styles.wrapper} showsButtons={false}>
                        <View style={styles.slide1}>
                            <Image style={styles.TransportImage}
                                source={require('../images/car.jpg')} />
                            <Text style={styles.text}>&#8358;</Text>
                            <Text style={styles.text}>{this.state.carPrice}</Text>
                            <Button
                                buttonStyle={{ marginTop: 10 }}
                                backgroundColor="black"
                                title="Book Ride"
                                onPress={() => this.onBookRide('car', this.state.carPrice)}
                            />


                        </View>
                        <View style={styles.slide2}>
                            <Image style={styles.TransportImage}
                                source={require('../images/auto.jpg')} />
                            <Text style={styles.text}>&#8358;</Text>
                            <Text style={styles.text}>{this.state.autoPrice}</Text>
                            <Button
                                buttonStyle={{ marginTop: 10 }}
                                backgroundColor="#03A9F4"
                                title="Book Ride"
                                onPress={() => this.onBookRide('auto', this.state.autoPrice)}
                            />
                        </View>
                    </Swiper>
                </View>


            </View>
        );
    }
}

const styles = StyleSheet.create({

    map: { ...StyleSheet.absoluteFillObject },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    text: {
        color: 'white'
    },

    slide1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0, 0.9)',
    },
    slide2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0, 0.9)',
    },

    TransportImage: {
        marginTop: 5,
        height: 100,
        width: 100,
        borderRadius: 75
    },

})