import React, { Component } from 'react';
import { FlatList, View, ActivityIndicator, Text, TextInput, Button, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Searchbar } from 'react-native-paper';

import Ionicons from 'react-native-vector-icons/Ionicons';

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
            currentMembers: [],
            photo: {}         
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
                //isLoading: false,
                contactData: responseJson,
                getContacts: true,
                searchCalled: false
              }, () => {
                // Refresh images 
                if (this.state.contactData && this.state.contactData.length > 0) {
                    for (let i = 0; i < this.state.contactData.length; i++) {
                        this.getImage(this.state.contactData[i].user_id);
                    }
                }
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
                //isLoading: false,
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

      async getImage(userId) {
        fetch("http://localhost:3333/api/1.0.0/user/"+ userId + "/photo", {
            method: "GET",
            headers: {
                'Content-Type': 'media/png',
                "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
            }
        })
        .then((response) => {
            if(response.status === 200){
              return response.blob()
            }else{
              throw "Something went wrong"
            }
        })
        .then((resBlob) => {
            let data = URL.createObjectURL(resBlob);
            // Updating object state with photo data
            this.setState((prevState) => ({
              // Spreading open the previous photo object and adding the new photo data with the user id
              photo: {
                ...prevState.photo,
                [userId]: data
              },
              // After the photo render is done moving on to displaying in the flatlist
              isLoading: false
            }));
        })
        .catch((err) => {
            console.log(err)
        })
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
                <View style={styles.container}>
                  <View style={styles.contactDetails}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('ChatDetails')}>
                      <Ionicons name="arrow-back" size={32} color="black" style={styles.arrow} />
                    </TouchableOpacity>
                    <Text style={styles.pageName}>Add members</Text>
                  </View>
                    {/* Flatlist being used to retrive all the photos based on the user id of the contactData */}
                    {/* This is happening before anything is actually displayed */}
                    <FlatList
                      data={this.state.contactData}              
                        renderItem= {({item}) => {
                          this.getImage(item.user_id)
                        }}
                        keyExtractor={(item) => item.user_id}
                      />
                </View>
            );
        }else{
            console.log(this.state.contactData);
            console.log(this.state.currentMembers.members);
            return(             
                <View style={styles.container}>
                  <View style={styles.contactDetails}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('ChatDetails')}>
                      <Ionicons name="arrow-back" size={32} color="black" style={styles.arrow} />
                    </TouchableOpacity>
                    <Text style={styles.pageName}>Add members</Text>
                  </View>
                  <Searchbar
                  style={styles.searchBar}
                  placeholder="Search..."
                  onChangeText={saveQuery => {
                    this.setState({ saveQuery }, () => {
                      this.searchContacts();
                    });
                  }}
                  value={this.state.saveQuery}
                  inputStyle={{ paddingTop: 0, paddingBottom: 18 }}
                />
                <View style={{ height: 680 }}>
                  {/* Nested scroll enabled because the flatlist is inside the scrollview */}
                  <ScrollView nestedScrollEnabled={true}>
                    <FlatList
                    data={this.state.contactData}              
                        renderItem= {({item}) => {
                            // Finding the member with the same user_id as the current item
                            let currentMemberID = this.state.currentMembers.members.find(member => member.user_id === item.user_id);
                            if(!currentMemberID){
                                return(
                                    <View style={styles.detailsContainer}>
                                      <Image
                                        source={{uri: this.state.photo[item.user_id]}}
                                        style={styles.image}
                                      />
                                        {/*<Text>{JSON.stringify(item)}</Text>*/}

                                        {/* Concatenating first name and last name together */}      
                                        <View style= {styles.nameStyle}>
                                          <>
                                          {this.state.getContacts && <Text style={styles.nameText}>{item.first_name + ' ' + item.last_name}</Text> }
                                          </>   
                                          <>
                                          {this.state.searchCalled && <Text style={styles.nameText}>{item.given_name + ' ' + item.family_name}</Text>  }
                                          </>                   
                                          <Text style={styles.email}>{item.email}</Text> 
                                          {/* Empty line inbetween account details*/}
                                          <Text>{' '}</Text>
                                        </View>  
                                        <TouchableOpacity
                                          onPress={() => {this.addMember(item.user_id)}}
                                          style={styles.add}
                                        >
                                          <Ionicons name="person-add" size={26} color="black"/>
                                        </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: 
  {
    flex: 1,
    borderWidth: 3,
    margin: 5,
    borderRadius: 15,
    borderColor: '#069139',
    backgroundColor: '#E5E4E2'  
  },
  contactDetails:
  {
    marginTop: 8,
    marginLeft: 10,
    marginRight: 15,
    flexDirection: 'row',
    width: '98%',
    alignSelf: 'center'
  },
  arrow:
  {
    marginTop: 3,
    marginLeft: 8
  },
  pageName:
  {
      color: '#069139',
      fontWeight: 'bold',
      fontSize: 22,
      marginTop: 5,
      marginBottom: 5,
      marginLeft:15
  },
  searchBar:
  {
    width: '95%',
    alignSelf: 'center',
    borderWidth: 1,
    height: 40,
    borderRadius: 10
  },
  nameStyle:
  {
    flex: 1,
  },
  image: 
  {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'black',
    marginLeft: 8,
    marginRight: 8
  },
  detailsContainer:
  {
    flexDirection: 'row', 
    alignItems: 'center',
    marginTop: 5,
    padding: 8,
    borderTopWidth: 1,
    width: '95%',
    alignSelf: 'center'
  },
  nameText:
  {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 14
  },
  email:
  {
    fontSize: 14,
    marginTop: 5
  },
  add:
  {
    marginRight: 15,
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'flex-end'
  }
})

export default AddtoChat

