import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, AsyncStorage, Alert } from "react-native";
import { Card, Button, Text } from "react-native-elements";
import { onSignOut, USER } from "../auth";
import { db } from "../../config/MyFirebase";
import firebase from 'react-native-firebase';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { listenUserName } from "../../config/database";
import RNGooglePlaces from 'react-native-google-places';
import MapViewDirections from 'react-native-maps-directions';
import { Container, Icon, Left, Header, Body, Right } from 'native-base';
import { connect } from 'react-redux';
import { setUserName } from "../../UserReducer";
import { listen4Drivers } from "../../config/database";
import Spinner from 'react-native-spinkit';
import { StackActions, NavigationActions } from "react-navigation";
import geofire from 'geofire';
import {GeoFirestore} from 'geofirestore';



class Home extends Component {
  static navigationOptions = { header: null }
  constructor(props) {
    super(props);
    this.state = {
      MyLocationLat: 0.02,
      MyLocationLong: 0.02,
      isLoading: true,
      driverLoading: true,
      Name: "",
      drivers: [],
      isMapReady: false

    }

    // We can get the driverId from async here and then dispatch and reset Navigator

    AsyncStorage.multiGet(['driverID', 'driverName'])
      .then(value => {
        console.log(value);

        if (value[0][1] == null && value[1][1] == null) {
          return null
        }
        else {
          const resetAction = StackActions.reset({
            index: 0,
            // U can pass params to the routeName
            actions: [
              NavigationActions.navigate({ routeName: 'ConnectingDriver', params: { driverId: value[0][1], driverName: value[1][1] } })
            ]
          });
          this.props.navigation.dispatch(resetAction);
        }
      });
    // The function below gets all drivers from firebase
    // It also gets called even after routing to connectingDriver


    db.database().ref('drivers').once('value', (snap) => {
      console.log("Not working here")
      if (this.isUnmounted) {
        return;
      }
      var drivers = [];

      snap.forEach((child) => {

        console.log(child.val().latitude)
        drivers.push({
          latitude: child.val().latitude,
          longitude: child.val().longitude,


        });

      });
      const opts = {
        yName: 'latitude',
        xName: 'longitude'
      }


      const PresentLocation = { latitude: this.state.MyLocationLat, longitude: this.state.MyLocationLong }
      const sortByDistance = require('sort-by-distance')


      const Newdrivers = sortByDistance(PresentLocation, drivers, opts)
      console.log('This is sliced drivers')
      console.log(Newdrivers.slice(0, 2))
      //this.setState({ drivers: Newdrivers.slice(0, 2), isLoading: false })
      this.setState({ drivers: Newdrivers.slice(0, 2), driverLoading: false })





    })
      .then(() => {
        console.log("Checked for drivers")
      })
      .catch(error => console.log('This db is not working again'));

    AsyncStorage.getItem(USER)
      .then(res => {

        if (res == null) {
          this.setState({ Name: "" });
        }
        else {
          this.setState({ Name: res });
        }

      })
      .catch(err => reject(err));

  }


  componentDidMount() {
    // Temporarily setting geofire for Drivers Working
    
    console.log('Is this Navigator working at all')
    // For some reasons, this function finishes before database listener in the constructor
    // But in our Slow Itel, this function gets called only after the constructor is finished
    // So we need to set up isloading here after component DidMount
    navigator.geolocation.getCurrentPosition(
      (position) => {

        // For some reason navigator refused to work on this itel phone
        console.log('What is goin on here itel')
        console.log(position)
        if (this.isUnmounted) {
          return;
        }

        this.setState({
          MyLocationLat: position.coords.latitude,
          MyLocationLong: position.coords.longitude,

          error: null,

          Name: "",
          isLoading: false


        });

      },
      (error) => {

        Alert.alert(error.message)
      },
      { timeout: 20000, maximumAge: 60000 },
    );


  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  SignOut = () => {
    firebase.auth().signOut()
      .then(() => onSignOut())
      .then(() => this.props.navigation.navigate("SignedOut"))
  }



  onMapLayout = () => {
    this.setState({ isMapReady: true });
  }

  onSearchPlace = () => {
    this.props.navigation.navigate("SearchPlace");
  }

  render() {
    if (this.state.isLoading || this.state.driverLoading) {
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


      /* return (
         <View style={styles.container}>
           <ActivityIndicator size="large" color="#00ff00" />
         </View>
       )*/
    }


    else {

      const PresentLocation = { latitude: this.state.MyLocationLat, longitude: this.state.MyLocationLong }
      const destination = { latitude: 6.465422, longitude: 3.406448 };
      const GOOGLE_MAPS_APIKEY = 'AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk';

      return (
        <Container>
          {/*<TouchableOpacity
          style={styles.button}
          onPress={() => this.openSearchModal()}
        >
          <Text>Pick a Place</Text>
        </TouchableOpacity>*/}

          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: this.state.MyLocationLat,
              longitude: this.state.MyLocationLong,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation={true}
            onLayout={this.onMapLayout}

          >
            {
              this.state.isMapReady &&
              <MapView.Marker coordinate={PresentLocation} />

            }
            {
              this.state.isMapReady &&
              this.state.drivers.map((driver, i) => (
                < MapView.Marker coordinate={{
                  latitude: driver.latitude,
                  longitude: driver.longitude,
                }}
                  style={{ width: 10, height: 10 }}
                  image={require('../images/car-marker3.png')}
                  key={i} />
              ))
            }


            {/*<MapView.Marker coordinate={origin} />
          <MapView.Marker coordinate={destination} />
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="hotpink"
        />*/}
          </MapView>
          <Header transparent>
            <Left>

              <Icon name="ios-menu" onPress={() =>
                this.props.navigation.openDrawer()} />

            </Left>
            <Body />
            <Right />
          </Header>

          { // Below is what gets data from redux store 
          }
          <Text style={{ color: 'blue' }}>{this.props.User.currentUserName}</Text>

          <View style={{ flex: 1 }}>
            <View style={styles.buttonsContainer}>
              <Button
                buttonStyle={{
                  backgroundColor: "rgba(0,0,0, 0.8)",
                  height: 45,
                  width: 300,
                  borderColor: "transparent",
                  borderWidth: 0,
                  borderRadius: 5
                }}
                containerStyle={{ marginTop: 20 }}
                title="Where To"
                onPress={() => this.onSearchPlace()}
              />
            </View>
          </View>
        </Container>
      )
    }
    /*
    return (
      <View style={{ paddingVertical: 20 }}>
        <Card title="John Doe">
          <View
            style={{
              backgroundColor: "#bcbec1",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: 40,
              alignSelf: "center",
              marginBottom: 20
            }}
          >
            <Text style={{ color: "white", fontSize: 28 }}>JD</Text>
          </View>
          <Button
            backgroundColor="#03A9F4"
            title="SIGN OUT"
            onPress={this.SignOut.bind(this)}
          />
        </Card>
      </View>
    );*/
  }
}
const styles = StyleSheet.create({

  map: { ...StyleSheet.absoluteFillObject },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  buttonsContainer: {
    alignItems: 'center'
  }

})
const mapDispatchToProps = (dispatch) => {
  return {
    setUserName: (text) => { dispatch(setUserName(text)) }
  };
}
const mapStateToProps = (state) => {
  const { User } = state
  return { User }
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);