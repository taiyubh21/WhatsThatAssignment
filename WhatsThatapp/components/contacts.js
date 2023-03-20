import React, { Component } from 'react';
import { FlatList, View, ActivityIndicator, Text, TextInput, Button } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

class Contacts extends Component {

    constructor(props){
        super(props);
        // Initialising states
        this.state = {
            // Used for loading icon
            isLoading: true,
            // For array of contact data
            contactData: []
        }
    }

    async getData(){
        return fetch("http://localhost:3333/api/1.0.0/contacts", {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
            }
          })    

        .then((response) => response.json())
        .then((responseJson) => {
            // Updating the contactData state with the retrieved data
            this.setState({
                isLoading: false,
                contactData: responseJson
            })
            console.log(responseJson);
            console.log(contactData);
            
        })
        .catch((error)=> {
            console.log(error);
        });
    }

    componentDidMount(){
        this.getData();
    }

    render(){
        // If data is still being fetched return a loading spinner
        if(this.state.isLoading){
            return(
                <View>
                    <ActivityIndicator/>
                </View>
            );
        }else{
            console.log("here:", this.state.contactData)
            return(
                <View>
                    <FlatList
                        data={this.state.contactData}              
                        renderItem= {({item}) => (
                            <View>
                                {/*<Text>{JSON.stringify(item)}</Text>*/}

                                {/* Concatenating first name and last name together */}                        
                                <Text>{item.first_name + ' ' + item.last_name}</Text> 
                                <Text>{item.email}</Text> 
                                {/* Empty line inbetween account details*/}
                                <Text>{' '}</Text>
                            </View>
                            )}
                        keyExtractor={(item) => item.user_id}
                    />
                </View>
            );
        }
    
    }
}

export default Contacts