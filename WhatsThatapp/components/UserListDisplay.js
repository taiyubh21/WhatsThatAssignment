import React, { Component } from 'react';
import { FlatList, View, ActivityIndicator, Text } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';


 class UserListDisplay extends Component {
    constructor(props){
        super(props);
        // Initialising states
        this.state = {
            // Used for loading icon
            isLoading: true,
            // For array of user data
            userListData: [],
            // For holding the ID of current user
            currentUserId: null
        };
        this.setCurrentUserId();
    }

    // Getting the current ID from async storage
    // Setting it to the new state
    // Making sure its an integer
    async setCurrentUserId() {
        const userId = await AsyncStorage.getItem("whatsthat_user_id");
        this.setState({ currentUserId: parseInt(userId) });
      }

    async getData(){
        return fetch("http://localhost:3333/api/1.0.0/search", {
            method: "GET",
            headers: {
              "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
            }
          })    

        .then((response) => response.json())
        .then((responseJson) => {
            // Updating the userListData state with the retrieved data
            this.setState({
                isLoading: false,
                userListData: responseJson
            })
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
        return(
            <View>
                <FlatList
                    data={this.state.userListData}              
                    renderItem= {({item}) => {
                        // Console code for checking the IDs of the data and the current ID of the account logged in
                        // For debugging
                        console.log("item user id:", item.user_id);
                        console.log("current user id:", this.state.currentUserId);
                        // If the user in the data has the same ID as the current user logged in then
                        // don't output their account
                        if(item.user_id !== this.state.currentUserId){
                            return(
                                <View>
                                    {/* Concatenating first name and last name together */}
                                    <Text>{item.given_name + ' ' + item.family_name}</Text> 
                                    <Text>{item.email}</Text> 
                                    {/* Empty line inbetween account details*/}
                                    <Text>{' '}</Text>
                                </View>
                                );
                            // If the user is the current user logged in return nothing
                            } else{
                                return null;
                            }
                    }}
                    keyExtractor={(item) => item.user_id}
                />
            </View>
        );
    }

}
}

export default UserListDisplay