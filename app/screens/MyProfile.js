import React, { Component } from 'react';
import { View, Text, Button, StyleSheet, Image } from "react-native";
import MaterialIcons from "react-native-vector-icons";

export default class MyProfile extends Component {
    static navigationOptions = {
        drawerLabel: 'Profile',
        drawerIcon: ({ tintColor }) => (
            <Image
                source={require('../images/user.png')}
                style={[styles.icon, { tintColor: tintColor }]}
            />
        )

    };

    render() {
        return (
            <Button
                onPress={() => this.props.navigation.navigate('MyNotificationsScreen')}
                title="Go to notifications"
            />
        );
    }

}
const styles = StyleSheet.create({
    icon: {
        width: 24,
        height: 24,
    },
});