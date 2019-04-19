import React, { Component } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { Card, Button, Input } from "react-native-elements";
import { onSignIn } from "../auth";
import { db } from "../../config/MyFirebase";
import firebase from 'react-native-firebase';
import { StackActions, NavigationActions } from "react-navigation";
import { TextField } from 'react-native-material-textfield';
import { RaisedTextButton } from 'react-native-material-buttons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';


let styles = {
  scroll: {
    backgroundColor: '#E8EAF6',
  },

  container: {
    margin: 8,
    marginTop: 24,
  },

  contentContainer: {
    padding: 8,
  },
};

export default class SignIn extends Component {
  constructor(props) {

    super(props);

    this.onFocus = this.onFocus.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onSubmitEmail = this.onSubmitEmail.bind(this);
    this.onSubmitPassword = this.onSubmitPassword.bind(this);
    this.onAccessoryPress = this.onAccessoryPress.bind(this);
    this.renderPasswordAccessory = this.renderPasswordAccessory.bind(this);

    this.emailRef = this.updateRef.bind(this, 'email');
    this.passwordRef = this.updateRef.bind(this, 'password');

    this.state = {
      authenticating: false,
      secureTextEntry: true,

    }
  }
  onFocus() {
    let { errors = {} } = this.state;

    for (let name in errors) {
      let ref = this[name];

      if (ref && ref.isFocused()) {
        delete errors[name];
      }
    }

    this.setState({ errors });
  }


  onChangeText(text) {
    ['email', 'password']
      .map((name) => ({ name, ref: this[name] }))
      .forEach(({ name, ref }) => {
        if (ref.isFocused()) {
          this.setState({ [name]: text });
        }
      });
  }

  onAccessoryPress() {
    this.setState(({ secureTextEntry }) => ({ secureTextEntry: !secureTextEntry }));
  }

  onSubmitEmail() {
    this.password.focus();
  }

  onSubmitPassword() {
    this.password.blur();
  }

  isEmptyError(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }

  onSubmit() {
    let errors = {};

    ['email', 'password']
      .forEach((name) => {
        let value = this[name].value();

        if (!value) {
          errors[name] = 'Should not be empty';
        } else {
          if ('password' === name && value.length < 6) {
            errors[name] = 'Too short';
          }
        }
      });

    this.setState({ errors });
    if (this.isEmptyError(errors)) {
      console.log('Nothing error')
      this.setState({ authenticating: true });
      console.log(this.state.email)
      console.log(this.state.password)
      firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(() => onSignIn())
        .then(() => {
          let user = firebase.auth().currentUser;
          console.log(user.uid);

          // Should input firestore details here temporarily

          

          //this.props.navigation.navigate("Drawer")
          /*this.props.navigation.navigate("HomeScreen", { idd: user.uid })*/
          var navActions = StackActions.reset({
            index: 0,
            key: null,
            actions: [
              NavigationActions.navigate({ routeName: "Drawer" })
            ]
          });

          this.props.navigation.dispatch(navActions);
        })

        .catch((error) =>
          /// We should Provide a way to tell user if this failed to authenticate
          /// instead of constantly loading the activity indicator
          console.log("No Authentication"))
    }
    else {
      console.log(errors)
    }
  }

  updateRef(name, ref) {
    this[name] = ref;
  }

  onCreateAccount = () => {
    console.log('Navigate Now')
    var navActions = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: "SignUp" })
      ]
    });

    this.props.navigation.dispatch(navActions);
    console.log('Whats goin on now')
  }

  UserSignIn = () => {
    this.setState({ authenticating: true });
    db.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => onSignIn())
      .then(() => {
        let user = db.auth().currentUser;
        console.log(user.uid);
        this.props.navigation.navigate("Drawer")
        /*this.props.navigation.navigate("HomeScreen", { idd: user.uid })*/
      })

      .catch((error) =>
        /// We should Provide a way to tell user if this failed to authenticate
        /// instead of constantly loading the activity indicator
        console.log("No Authentication"))
  }

  renderPasswordAccessory() {
    let { secureTextEntry } = this.state;

    let name = secureTextEntry ?
      'visibility' :
      'visibility-off';

    return (
      <MaterialIcon
        size={24}
        name={name}
        color={TextField.defaultProps.baseColor}
        onPress={this.onAccessoryPress}
        suppressHighlighting
      />
    );
  }

  render() {
    let { errors = {}, secureTextEntry, ...data } = this.state;
    const { email, password } = this.state;
    if (this.state.authenticating) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <ActivityIndicator size='large' color="#00ff00" />
        </View>
      )
    }
    return (
      <View style={{ paddingVertical: 20, padding: 8 }}>
        <Card title="SIGN IN">
          <TextField
            ref={this.emailRef}
            value={data.email}
            keyboardType='email-address'
            autoCapitalize='none'
            //tintColor='#51bc8a'
            baseColor='#008080'
            textColor='#51bc8a'
            autoCorrect={false}
            enablesReturnKeyAutomatically={true}
            onFocus={this.onFocus}
            onChangeText={this.onChangeText}
            onSubmitEditing={this.onSubmitEmail}
            returnKeyType='next'
            label='Email Address'
            error={errors.email}
          />

          <TextField
            ref={this.passwordRef}
            value={data.password}
            secureTextEntry={secureTextEntry}
            autoCapitalize='none'
            baseColor='#008080'
            autoCorrect={false}
            enablesReturnKeyAutomatically={true}
            clearTextOnFocus={true}
            onFocus={this.onFocus}
            onChangeText={password => this.setState({ password })}
            onSubmitEditing={this.onSubmitPassword}
            returnKeyType='done'
            label='Password'
            error={errors.password}
            //title='Choose wisely'
            maxLength={30}
            characterRestriction={20}
            renderAccessory={this.renderPasswordAccessory}
          />

          {/*<Input
            label="Email Address"
            placeholder='Email'
            onChangeText={email => this.setState({ email })}
            errorStyle={{ color: 'red' }}
            errorMessage='Enter a Valid Email Address'
          />
          <Input
            label="Password"
            placeholder='Password'
            onChangeText={password => this.setState({ password })}
            secureTextEntry={true}
            errorStyle={{ color: 'red' }}
            errorMessage='Password must be more than 4 characters'
          />

          <Button
            buttonStyle={{ marginTop: 20 }}
            backgroundColor="#03A9F4"
            title="SIGN IN"
            onPress={this.UserSignIn.bind(this)}
          />
          <Button
            buttonStyle={{ marginTop: 20 }}
            backgroundColor="#03A9F4"
            title="Forgot Password"
            onPress={() => this.props.navigation.navigate("ForgotPassword")}
          />
          <Button
            buttonStyle={{ marginTop: 20 }}
            backgroundColor="#03A9F4"
            title="Sign Up"
            onPress={() => this.onCreateAccount()}
          />*/}
          <View style={styles.container}>
            <RaisedTextButton onPress={this.onSubmit} title='submit' color={TextField.defaultProps.tintColor} titleColor='white' />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', }}>
            <TouchableOpacity onPress={() => this.onCreateAccount()} style={{ marginTop: 20 }}>
              <Text style={{ color: 'green' }}>
                Register
          </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.onCreateAccount()} style={{ marginTop: 20 }}>
              <Text style={{ color: '#808080' }}>
                Forgot Password?
          </Text>
            </TouchableOpacity>
          </View>

        </Card>
      </View>
    );
  }
}
