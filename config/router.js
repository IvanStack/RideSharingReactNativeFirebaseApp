import React from 'react';
import { Text, Colors, TouchableOpacity, View, Image, StyleSheet, AsyncStorage } from "react-native";
import { createStackNavigator, createDrawerNavigator } from "react-navigation";
import HomeScreen from "../app/screens/HomeScreen";
import SignIn from "../app/screens/SignIn";
import SignUp from "../app/screens/SignUp";
import Home from "../app/screens/Home";
import BookRide from "../app/screens/BookRide";
import SearchPlace from "../app/screens/SearchPlace";
import ConnectingDriver from "../app/screens/ConnectingDriver";
import MyProfile from "../app/screens/MyProfile";
import MyNotificationsScreen from "../app/screens/MyNotificationsScreen";
import ForgotPassword from "../app/screens/ForgotPassword";
import { USER } from "../app/auth";
import MaterialIcons from "react-native-vector-icons";
import { Container, Icon, Left, Content, Header, Body, Right } from 'native-base';
import DrawerComponent from './DrawerContent'





export const MyApp = createStackNavigator({
    Main: {
        screen: Home
    },

    SearchPlace: {
        screen: SearchPlace,

        navigationOptions: {
            tabBarLabel: "Search",
            tabBarIcon: ({ tintColor }) => (
                <FontAwesome name="user" size={30} color={tintColor} />
            )


        }
    },
    BookRide: {
        screen: BookRide,
        navigationOptions: {
            tabBarLabel: "Booking",
            tabBarIcon: ({ tintColor }) => (
                <FontAwesome name="user" size={30} color={tintColor} />
            )
        }
    },
    ConnectingDriver: {
        screen: ConnectingDriver,
        navigationOptions: {
            tabBarLabel: "Driver",
            tabBarIcon: ({ tintColor }) => (
                <FontAwesome name="user" size={30} color={tintColor} />
            )
        }
    }
});



export const HomeStack = createDrawerNavigator({
    /*HomeScreen: {
         screen: HomeScreen,
         navigationOptions: {
             title: "Home",
 
         }
     },*/
    Home: {
        screen: MyApp
    },

    MyProfile: {
        screen: MyProfile

    },
    MyNotificationsScreen: {
        screen: MyNotificationsScreen
    }

},
    {
        initialRouteName: 'Home',
        drawerPosition: 'left',
        drawerBackgroundColor: 'blue',
        contentComponent: DrawerComponent,
        drawerOpenRoute: 'DrawerOpen',
        drawerCloseRoute: 'DrawerClose',
        drawerToggleRoute: 'DrawerToggle'

    });


const Route = (val) => {
    if (val) {
        return ('Drawer')
    }
    return ('SignIn')

}

// Below function will route to Drawer if signedIn is true else SignedOut
// It will also route to NewUser if its a first time user
export const RootNavigator = (val) => {

    return createStackNavigator(

        {
            SignIn: {
                screen: SignIn,
                navigationOptions: {
                    title: "Sign In",


                }

            },

            SignUp: {
                screen: SignUp,
                navigationOptions: {
                    title: "Sign Up",


                }
            },
            ForgotPassword: {
                screen: ForgotPassword,
                navigationOptions: {
                    title: "Forgot Password",

                }
            },

            Drawer: {
                screen: HomeStack
            }

        },
        {
            initialRouteName: Route(val)
        }


    )
}

const styles = StyleSheet.create({
    drawerImage: {
        width: 150,
        height: 150,
        borderRadius: 75
    },
});