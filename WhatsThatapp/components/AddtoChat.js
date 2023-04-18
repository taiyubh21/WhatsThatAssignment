import React, { Component } from 'react';
import { FlatList, View, ActivityIndicator, Text, TextInput, Button, ScrollView } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

class AddtoChat extends Component {

    constructor(props){
        super(props);
        // Initialising states
        this.state = {
            // Used for loading icon
            isLoading: true,
            // For array of contact data
            contactData: [],
            // To store users search query
            saveQuery: "",
            getContacts: false,
            searchCalled: false,
            currentUserId: null,
            currentChatId: null,
            currentMembers: []         
        }
        this.setCurrentUserId();
        this.setChatId();
    }

    async setCurrentUserId() {
        const userId = await AsyncStorage.getItem("whatsthat_user_id");
        this.setState({ currentUserId: parseInt(userId) });
        console.log("Current user ID:" + this.state.currentUserId);
      }

      async setChatId() {
        const chatID = await AsyncStorage.getItem("chat_id");
        this.setState({ currentChatId: parseInt(chatID) });
        console.log("Current chat ID:" + this.state.currentChatId);
      }

    async getData(){
        return fetch("http://localhost:3333/api/1.0.0/contacts", {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
            }
          })    

          .then((response) => {
            if(response.status === 200){
                return response.json()
            }else{
                throw "Error";
            }
        })
        .then((responseJson) => {
            // Updating the contactData state with the retrieved data
            this.setState({
                isLoading: false,
                contactData: responseJson,
                getContacts: true,
                searchCalled: false
            })
        })
        .catch((error)=> {
            console.log(error);
        });
    }

    async getMembers(){
        return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.currentChatId, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
            }
          })    
          .then((response) => {
            if(response.status === 200){
                return response.json()
            }else{
                throw "Error";
            }
        })
        .then((responseJson) => {
            this.setState({
                isLoading: false,
                currentMembers: responseJson
            })
            console.log(this.state.currentMembers)
        })
        .catch((error)=> {
            console.log(error);
        });
      }

    async searchContacts(){
        return fetch("http://localhost:3333/api/1.0.0/search?q="+ this.state.saveQuery + "&search_in=contacts", {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
            }
          })    
          .then((response) => {
            if(response.status === 200){
                return response.json()
            }else{
                throw "Error";
            }
        })
        .then((responseJson) => {
            // Updating the contactData state with the retrieved data
            this.setState({
                isLoading: false,
                contactData: responseJson,
                searchCalled: true,
                getContacts: false
            })
            
        })
        .catch((error)=> {
            console.log(error);
        });
    }

    

    async addMember(userID){
        return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.currentChatId + "/user/" + userID,
        {
          method: 'POST',
          headers: {
            "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
          }
        })
        .then(async(response) => {
            // If the response is ok  
            if(response.status === 200){
                console.log('Contact has been added to chat successfully');
                this.getMembers();
                this.getData();
            // Else if its bad then throw an error
            }else{
              // Output error on screen for other responses
              throw "error"
            }
          })
          .catch((error)=> {
            console.log(error);
        });
      }


    // For refreshing page
    componentDidMount() {
        this.setChatId()
        .then(() => this.getMembers())
        .then(() => this.getData())
        .then(() => this.searchContacts())
        .catch((error) => console.log(error));
        this.resetData = this.props.navigation.addListener('focus', () => {
          // Reset states back to how they were
          this.setState({
            isLoading: true,
            contactData: [],
            saveQuery: ""
          }, () => {
            // Call getData after resetting the state
            this.setChatId()
            .then(() => this.getMembers())
            .then(() => this.getData())
            .then(() => this.searchContacts())
            .catch((error) => console.log(error));
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
            console.log(this.state.contactData);
            console.log(this.state.currentMembers.members);
            return(
                
                <View>
                <Button
                    title="Go back to chat details"
                    onPress={() => this.props.navigation.navigate('ChatDetails')}
                />
                <TextInput placeholder = "Search..." onChangeText={saveQuery => this.setState({saveQuery})} defaultValue={this.state.saveQuery}></TextInput>
                {/* Refreshing list of users when button is pressed */}
                <Button
                    title="Search"
                    onPress={() => this.searchContacts()}
                />
                <View style={{ height: 600 }}>
                  {/* Nested scroll enabled because the flatlist is inside the scrollview */}
                  <ScrollView nestedScrollEnabled={true}>
                    <FlatList
                    data={this.state.contactData}              
                        renderItem= {({item}) => {
                            // Finding the member with the same user_id as the current item
                            let currentMemberID = this.state.currentMembers.members.find(member => member.user_id === item.user_id);
                            if(!currentMemberID){
                                return(
                                    <View>
                                        {/*<Text>{JSON.stringify(item)}</Text>*/}

                                        {/* Concatenating first name and last name together */}      
                                        <>
                                        {this.state.getContacts && <Text>{item.first_name + ' ' + item.last_name}</Text> }
                                        </>   
                                        <>
                                        {this.state.searchCalled && <Text>{item.given_name + ' ' + item.family_name}</Text>  }
                                        </>                   
                                        <Text>{item.email}</Text> 
                                        <Button
                                          title="Add contact to chat"
                                          onPress={() => this.addMember(item.user_id)}
                                        />
                                        {/* Empty line inbetween account details*/}
                                        <Text>{' '}</Text>
                                    </View>
                                );
                            }else{
                                return null;
                            }
                        }}
                        keyExtractor={(item) => item.user_id}
                    />
                    </ScrollView>
                  </View>
                </View>
            );
        }
    
    }
}

export default AddtoChat

