
import { combineReducers } from 'redux';

const INITIAL_STATE = {
    currentUserName: "",

};

const UserReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "setUserName": return { ...state, currentUserName: action.value };

        default:
            return state
    }
};

export default combineReducers({
    User: UserReducer,
});



// Action Creators

const setUserName = (Name) => {
    return {
        type: 'setUserName',
        value: Name
    };
};

export { setUserName };
