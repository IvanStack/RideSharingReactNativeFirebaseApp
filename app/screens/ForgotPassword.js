import React, { Component } from 'react';
import { View } from "react-native";
import { Card, Button, Input } from "react-native-elements";
import { db } from "../../config/MyFirebase";

export default class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: ""
        }
    }

    onPasswordReset = () => {
        db.auth().sendPasswordResetEmail(this.state.email)
            .then(() => console.log("Reset Link has been sent to your email"))
            .catch((error) => console.log(error))
    }

    render() {
        return (
            <View style={{ paddingVertical: 20 }}>
                <Card title="Your Email">
                    <Input
                        label="Email Address"
                        placeholder='Email'
                        onChangeText={email => this.setState({ email })}
                        errorStyle={{ color: 'red' }}
                        errorMessage='Enter Your Email Address'
                    />
                    <Button
                        buttonStyle={{ marginTop: 20 }}
                        backgroundColor="#03A9F4"
                        title="Send"
                        onPress={this.onPasswordReset.bind(this)}
                    />
                </Card>
            </View>
        )
    }
}