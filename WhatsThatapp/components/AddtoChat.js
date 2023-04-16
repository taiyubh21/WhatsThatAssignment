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
            currentMembersId: []         
        }
        this.setCurrentUserId();
        this.setChatId();
        this.setMembersUserID();
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

      async setMembersUserID() {
        const MembersUserID = await AsyncStorage.getItem("membersUserID");
        this.setState({ currentMembersId: parseInt(memberIDs) });
        console.log("Current member ID:" + this.state.currentMembersId);
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

    // For refreshing page
    componentDidMount() {
        this.getData();
        this.searchContacts();
        this.resetData = this.props.navigation.addListener('focus', () => {
          // Reset states back to how they were
          this.setState({
            isLoading: true,
            contactData: [],
            saveQuery: ""
          }, () => {
            // Call getData after resetting the state
            this.getData();
            this.searchContacts();
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
                        renderItem= {({item}) => (
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
                                {/* Empty line inbetween account details*/}
                                <Text>{' '}</Text>
                                {/* Passes user id into deleteContacts and then calls this.getData() so you can visibly see the contact has deleted */}
                            </View>
                            )}
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