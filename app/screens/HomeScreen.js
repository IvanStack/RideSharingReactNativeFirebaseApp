import React, { Component } from 'react';


import {

    StyleSheet,
    AsyncStorage,
    Text,
    View,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { Card, Button } from "react-native-elements";
import { listenUserName } from "../../config/database";
import { db } from "../../config/MyFirebase";
import { USER } from "../auth";
import RNGooglePlaces from 'react-native-google-places';
import { Container, Icon, Left, Header, Body, Right } from 'native-base';

export default class HomeScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            Name: "",
            isAuthenticated: false


        }
        /*The below AsyncStorage will get the Name of the user that signed up
        with the App. It would not provide the Name of a user who already has
        an account with the app but used your device to sign in. So the best
        approach will be to remove the Name of the user from AsyncStore when
        the user signs out of the app. And then set the name of the present user 
        when the user signs in to the app
        */
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

        db.auth().onAuthStateChanged((user) => {

            if (user) {
                this.setState({
                    isAuthenticated: true
                });
                let id = user.uid
                listenUserName(id, (Name) => {

                    this.setState({
                        Name: Name

                    });
                    //Below Stores Name of User for future Reference
                    AsyncStorage.setItem(USER, Name)
                });

            }
        });
    }

    componentDidMount() {


        /*
        console.log(this.state.isAuthenticatedReady);
        try {
            console.log("Now Trying");
            let user = db.auth().currentUser;
            let id = user.uid;

            // Listen for Name Changes with a callback
            listenUserName(id, (Name) => {
                console.log(Name);
                this.setState({
                    Name: Name

                });

                
            });


        } catch (error) {
            console.log(error);
        }

    */}
    onProfile = () => {
        this.props.navigation.navigate("MyApp");
    }
    render() {
        const { Name } = this.state;
        return (

            <Container>
                <Header transparent>
                    <Left>

                        <Icon name="ios-menu" onPress={() =>
                            this.props.navigation.openDrawer()} />

                    </Left>
                    <Body />
                    <Right />
                </Header>
                <Card>
                    <Text>New Develop</Text>
                    <Text>{this.state.Name}</Text>
                    <Button
                        buttonStyle={{ marginTop: 20 }}
                        backgroundColor="#03A9F4"
                        title="Map"
                        onPress={() => this.onProfile()}
                    />
                    <Button
                        buttonStyle={{ marginTop: 20 }}
                        backgroundColor="#03A9F4"
                        title="Profile"
                        onPress={() => this.props.navigation.openDrawer()}
                    />
                </Card>
            </Container>
        );
    }
}