import React, { Component } from "react";
import { RootNavigator } from "./config/router";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import UserReducer from './UserReducer';
import { db } from "./config/MyFirebase";
import Spinner from 'react-native-spinkit';
import firebase from 'react-native-firebase';
import { Image, Alert, View } from 'react-native'

// Redux Store for User
const store = createStore(UserReducer);



export default class App extends Component {
  constructor(props) {
    super(props);


    this.state = {
      isLoadingComplete: false,
      isAuthenticationReady: false,
      isAuthenticated: false,
      isUnmounted: false

    };
    this.unsubscriber = firebase.auth().onAuthStateChanged(this.onAuthStateChanged)
    //db.auth().onAuthStateChanged(this.onAuthStateChanged)

  }

  onAuthStateChanged = (user) => {
    console.log("authenticated Now")
    console.log(user)
    this.setState({ isAuthenticationReady: true });
    this.setState({ isAuthenticated: !!user });
    this.unsubscriber();
    console.log('Zaza')

  };




  componentWillUnmount() {
    console.log('Unmounting')
  }


  render() {
    console.log('It is Showing')
    // If we haven't checked AsyncStorage yet, don't render anything (better ways to do this)
    if (!this.state.isLoadingComplete && !this.state.isAuthenticationReady) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0, 0.9)'
            }}
          >
            <Image
              style={{
                backgroundColor: '#ccc',
                flex: 1,
                resizeMode: 'contain',
                position: 'absolute',
                width: '100%',
                height: '100%',
                justifyContent: 'center',
              }}
              source={require('./app/images/BertaCabs.jpg')}
            />
          </View>
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
      //return null;
      //OR
      // return <ActivityIndicator />
    }


    // Sends signedIn state as parameter to Navigator in router.js file
    const Layout = RootNavigator(this.state.isAuthenticated);

    console.log("Repeated Again")
    return (
      <Provider store={store}>
        <Layout />
      </Provider>
    )

  }
}
