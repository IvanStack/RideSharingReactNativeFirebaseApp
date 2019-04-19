import React, { Component } from 'react';
import { SearchBar } from 'react-native-elements'
import { View, Image, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import RNGooglePlaces from 'react-native-google-places';

export default class SearchPlace extends Component {
    static navigationOptions = { header: null }
    constructor(props) {
        super(props);

        this.state = {
            place: "",
            concatDestinationLot: "",
            currentPlace: "",
            results: []
        }
    }
    async getLocationCoord(locationID) {

        //U must find a way to wait for this function below to give u a value
        await RNGooglePlaces.lookUpPlaceByID(locationID)
            .then((result) => {
                const coord = this.mergeLot(result.latitude, result.longitude);
                this.setState({ concatDestinationLot: coord });
                console.log("Hi");
            })
            .catch(error => console.log(error))
        console.log('No');
        return (this.state.concatDestinationLot);
    };

    onLocation(location) {
        //We will have to send location to the map that needs to render
        //the route directions. So we navigate to that map

        let placeID = location.placeID

        this.props.navigation.navigate("BookRide", { placeID });

    }

    openSearchModal(data) {
        // This fucntion gives us autocomplete list when we seacrh for places

        RNGooglePlaces.getAutocompletePredictions(data)
            .then((place) => {
                this.setState({
                    results: place
                })


                // place represents user's selection from the
                // suggestions and it is a simplified Google Place object.
            })
            .catch(error => console.log(error.message));  // error is a Javascript Error object
    }
    render() {
        const { place } = this.state;
        return (
            <View style={styles.container}>
                {/*<TouchableOpacity
              style={styles.button}
              onPress={() => this.openSearchModal()}
            >
              <Text>Pick a Place</Text>
            </TouchableOpacity>*/}
                <View style={styles.body}>
                    <SearchBar


                        platform="android"
                        value={place}
                        onChangeText={(place) => {
                            this.setState({ place });
                            this.openSearchModal(place)
                        }}

                        placeholder='Search Place' />
                    {
                        this.state.results ?
                            <FlatList
                                data={this.state.results}
                                renderItem={({ item }) =>
                                    <TouchableOpacity onPress={() => this.onLocation(item)}>
                                        <Text style={styles.item}>{item.fullText}</Text>
                                    </TouchableOpacity>
                                }
                            />
                            : (
                                <Text>Loading....</Text>
                            )
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    /*container: {
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#d6d7da',
    },*/
    body: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 10
    },
    button: {
        backgroundColor: '#DDDDDD',
        padding: 10
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
})