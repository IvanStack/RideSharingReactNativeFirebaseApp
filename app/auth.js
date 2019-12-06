import { AsyncStorage } from "react-native";
export const USER_KEY = "auth-demo-key";
export const FIRST_USER_KEY = "first-user"
export const USER = "User"
export const onSignIn = () => AsyncStorage.setItem(USER_KEY, "true");
export const onSignOut = () => AsyncStorage.multiRemove([USER_KEY, USER]);

export const firstUser = (Name) => AsyncStorage.multiSet([[FIRST_USER_KEY, "true"], [USER, Name]])

// resolve to true if User is a First Time User of the App, else resolve to false
export const isFirstUser = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(FIRST_USER_KEY)
      .then(res => {
        if (res == null) {
          resolve(true);
        }
        else {
          resolve(false);
        }
      })
      .catch(err => reject(err));
  });
};

export const isSignedIn = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(USER_KEY)
      .then(res => {
        if (res !== null) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(err => reject(err));
  });
};
