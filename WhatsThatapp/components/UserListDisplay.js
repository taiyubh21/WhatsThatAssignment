import React, { Component } from 'react';
import { FlatList, View, ActivityIndicator, Text, TextInput, Button } from 'react-native';

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
            currentUserId: null,
            // To store users search query
            saveQuery: ""
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
        // Changing the API link to include the search parameter state
        return fetch("http://localhost:3333/api/1.0.0/search?q=" + this.state.saveQuery, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
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

    async addContacts(contactuserID){
        return fetch("http://localhost:3333/api/1.0.0/user/" + contactuserID + "/contact",
        {
          method: 'POST',
          headers: {
            "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
          }
        })
        .then((response) => {
            // If the response is ok  
            if(response.status === 200){
                console.log('Contact added successfully');
            // Else if its bad then throw an error
            }else{
              // Output error on screen for other responses
              throw "error"
            }
          })
      }

    componentDidMount() {
        this.getData();
        this.resetData = this.props.navigation.addListener('focus', () => {
          // Reset states back to how they were
          this.setState({
            isLoading: true,
            userListData: [],
            saveQuery: ""
          }, () => {
            // Call getData after resetting the state
            this.getData();
          });
        });
      }
    
      componentWillUnmount() {
        this.resetData();
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
                {/* Update saveQuery state with value from input */}
                {/* Set default value to the current saveQuery state */}
                <TextInput placeholder = "Search..." onChangeText={saveQuery => this.setState({saveQuery})} defaultValue={this.state.saveQuery}></TextInput>
                {/* Refreshing list of users when button is pressed */}
                <Button
                    title="Search"
                    onPress={() => this.getData()}
                />
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
                                    <Button
                                        title="Add to contacts"
                                        onPress={() => this.addContacts(item.user_id)}
                                    />
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