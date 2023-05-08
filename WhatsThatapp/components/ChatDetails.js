import React, { Component } from 'react';
import { Text, TextInput, View, TouchableOpacity, Button, ActivityIndicator, ScrollView, FlatList, Image, StyleSheet} from 'react-native';


import AsyncStorage from '@react-native-async-storage/async-storage';

import Ionicons from 'react-native-vector-icons/Ionicons';

class ChatDetails extends Component {
  constructor(props){
    super(props);

    // Initialising state variables
    this.state = {
      isLoading: true,
      chatData: [],
      chatname: "",
      currentChatId: null,
      // Error message for failed validation
      error: "",
      // Checks if submission has happened or not
      submitted: false,
      photo: {},
      errorTimer: null
    }
    // Binding to onPressButton function
    this.onPressButton = this.onPressButton.bind(this)
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
  
  async getData() {
    // Checking if the currentChatID is null before making the API call
    if (!this.state.currentChatId) {
      this.setState({
        //isLoading: false,
        chatData: []
      });
      return;
    }
  
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
          chatData: responseJson
        }, () => {
          if (this.state.chatData.members && this.state.chatData.members.length > 0) {
              for (let i = 0; i < this.state.chatData.members.length; i++) {
                  this.getImage(this.state.chatData.members[i].user_id);
              }
          }
      })
  })
    .catch((error)=> {
      console.log(error);
    });
  }
  

  //Updating user - interacting with the API
  async updateChat(){

    let to_send = {};

    if(this.state.chatname != ""){
        to_send['name'] = this.state.chatname
    }
    
    console.log(JSON.stringify(to_send));
    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.currentChatId,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json',
      "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token") 
    },
      // Creating JSON with the user data
      body: JSON.stringify(to_send)
    })
    // Handles API response
    // Checks if it is a success or if there is an error
    .then((response) => {
      console.log(response); // log the entire response object
      if(response.status === 200){
        console.log("Chat name has been updated");
      }else if(response.status === 400){
        throw "Please try again"
      }
    })
    .catch((error) => {
      console.log(error)
      this.setState({error: "error"})
      this.setState({submitted: false})
    });
  }

  async deleteMember(chatuserID){
    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.currentChatId + "/user/" + chatuserID,
    {
      method: 'DELETE',
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then((response) => {
        // If the response is ok  
        if(response.status === 200){
            console.log('Member removed successfully');
            if(this.state.currentUserId == chatuserID){
              this.setState({currentChatId: null})
              this.props.navigation.navigate('ChatList')

            };        
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

  // For input validation
  onPressButton(){
    this.setState({submitted: true})
    this.setState({error: ""})

    // If inputs aren't valid according to the validation error message will return
    // If inputs are null no need for validation
    // Checks with the email validator if the email is valid
    if(this.state.chatname == ""){
        this.setState({error: "Chat must have a name"})
        this.setState({errorTimer: setTimeout(() => {
          this.setState({error: null, errorTimer: null})
        }, 5000)})
        return;
    }

    this.updateChat()
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.setChatId()
      .then(() => this.getData())
      .catch((error) => console.log(error));
    })
  }

  componentWillUnmount(){
    this.unsubscribe();
    if(this.state.errorTimer){
      clearTimeout(this.state.errorTimer) 
    }
  }

  render() {
        // If data is still being fetched return a loading spinner
        if(this.state.isLoading){
          return(
              <View>
                  <ActivityIndicator/>
                    {/* Flatlist being used to retrive all the photos based on the user id of the contactData */}
                    {/* This is happening before anything is actually displayed */}
                    <FlatList
                      data={this.state.chatData.members}              
                        renderItem= {({item}) => {
                          this.getImage(item.user_id)
                        }}
                        keyExtractor={(item) => item.user_id}
                      />
              </View>
          );
        }else{
    return (
      <View style={styles.container}>
        <View style={styles.conversationDetails}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('ConversationDisplay')}>
            <Ionicons name="arrow-back" size={32} color="black" style={styles.arrow} />
          </TouchableOpacity>
          <Text style={styles.pageName}>Chat Details</Text>
        </View>
        <View style = {styles.form}>
          <TextInput style = {styles.textInput} placeholder = "Chat name..." onChangeText={chatname => this.setState({chatname})} defaultValue={this.state.chatData.name}></TextInput>
          {/* Output error if there is an error */}
          <>
            {this.state.error && <Text style={styles.errorMessage}>{this.state.error}</Text>}
          </>
          <TouchableOpacity  style= {styles.updateChatButton} onPress={() => {
            this.onPressButton();
          }}>
            <Text style={styles.updateChatText}>Update chat name</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.contacts}
          onPress={() => this.props.navigation.navigate('AddtoChat')}
        >
          <Text style={styles.buttonText}>Add contacts to chat</Text>
        </TouchableOpacity> 
        <Text>{"\n"}</Text>       
        <View style={{ height: 510 }}>
            {/* Nested scroll enabled because the flatlist is inside the scrollview */}
            <Text style={styles.text}>Members in {this.state.chatData.name}:</Text>
            <ScrollView nestedScrollEnabled={true}>
              <FlatList
                data={this.state.chatData.members}
                renderItem={({item}) => (
                  <View style={styles.detailsContainer}>
                    <Image
                      source={{uri: this.state.photo[item.user_id]}}
                      style={styles.image}
                    />
                    <View style= {styles.nameStyle}>
                      <Text style={styles.nameText}>{item.first_name + ' ' + item.last_name}</Text>
                      <Text style={styles.email}>{item.email}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {this.deleteMember(item.user_id)}}
                      style={styles.remove}
                    >
                      <Ionicons name="person-remove" size={26} color="black"/>
                    </TouchableOpacity>
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
  conversationDetails:
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
  form:
  {
      borderWidth: 3,
      margin: 15,
      borderRadius: 15,
      borderColor: '#069139',
      padding: 15
  },
  textInput: 
  {
    width: '60%',
    height: 40,
    padding: 10,
    borderBottomWidth: 1,
  },
  updateChatButton:
  {
    width: '45%',
    borderRadius: 5,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 3,
    borderColor: '#069139',
    backgroundColor: '#069139'
  },
  updateChatText:
  {
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14
  },
  contacts:
  {
    width: '60%',
    borderRadius: 5,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#069139',
    backgroundColor: '#069139',
    alignSelf: 'center'
  },
  buttonText:
  {
    color: 'white', 
    fontWeight:'bold'
  },
  text:
  {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5
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
  remove:
  {
    marginRight: 15,
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'flex-end'
  },
  errorMessage:
  {
    color: 'red'
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
  }
})

export default ChatDetails