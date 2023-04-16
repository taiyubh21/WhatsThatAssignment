import React, { Component } from 'react';
import { FlatList, View, ActivityIndicator, Text, TextInput, Button, ScrollView } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

class BlockedUsers extends Component {

    constructor(props){
        super(props);
        // Initialising states
        this.state = {
            // Used for loading icon
            isLoading: true,
            // For array of contact data
            blockedData: [],
            currentUserId: null
        }
        this.setCurrentUserId();
    }

    async setCurrentUserId() {
        const userId = await AsyncStorage.getItem("whatsthat_user_id");
        this.setState({ currentUserId: parseInt(userId) });
        console.log("Current user ID:" + this.state.currentUserId);
      }

    async getData(){
        return fetch("http://localhost:3333/api/1.0.0/blocked", {
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
                blockedData: responseJson
            })
        })
        .catch((error)=> {
            console.log(error);
        });
    }

    async unblockContact(blockuserID){
        return fetch("http://localhost:3333/api/1.0.0/user/" + blockuserID + "/block",
        {
          method: 'DELETE',
          headers: {
            "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
          }
        })
        .then((response) => {
            // If the response is ok  
            if(response.status === 200){
                console.log('Contact unblocked successfully');
                this.getData();
            // Else if its bad then throw an error
            }else{
              // Output error on screen for other responses
              throw "error"
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }

    componentDidMount() {
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
            console.log(this.state.blockedData);
            return(
                <View>
                <View style={{ height: 645 }}>
                  {/* Nested scroll enabled because the flatlist is inside the scrollview */}
                  <ScrollView nestedScrollEnabled={true}>
                    <FlatList
                    data={this.state.blockedData}              
                        renderItem= {({item}) => (
                            <View> 
                                <Text>{item.first_name + ' ' + item.last_name}</Text>                   
                                <Text>{item.email}</Text> 
                                {/* Empty line inbetween account details*/}
                                <Button
                                    title="Unblock user"
                                    onPress={() => this.unblockContact(item.user_id)}
                                />
                                <Text>{' '}</Text>
                            </View>
                            )}
                        keyExtractor={(item) => item.user_id}
                    />
                    </ScrollView>
                  </View>
                  <Text>{' '}</Text>
                  <Button
                    title="Go back to contacts"
                    onPress={() => this.props.navigation.navigate('ContactsScreen')}
                  />
                  </View>
            );
        }
    
    }
}

export default BlockedUsers