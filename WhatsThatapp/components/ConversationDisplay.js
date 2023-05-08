import React, { Component } from 'react';
import { FlatList, View, ActivityIndicator, Text, TextInput, Button, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Ionicons from 'react-native-vector-icons/Ionicons';

class ConversationDisplay extends Component {
  constructor(props){
    super(props);
  
    // Initialising state variables
    this.state = {
      isLoading: true,
      chatData: [],
      currentUserId: null,
      currentChatId: null,
      message: "",
      modalVisible: false,
      selectedMessage: "",
      // Error message for failed validation
      error: "",
      // Checks if submission has happened or not
      submitted: false,
      sendMessage: "",
      errorTimer: null,
      messageTimer: null
    }
    this.setCurrentUserId();
    this.setChatId();
    this.onPressButton = this.onPressButton.bind(this)
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

  handleMessage = (message) => {
    this.setState({ 
      modalVisible: true, 
      selectedMessage: message,
    });
  };
  
  async getData(){
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
            chatData: responseJson
        })
    })
    .catch((error)=> {
        console.log(error);
    });
  }

  async newMessage(){
    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.currentChatId + "/message",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      },
      // Creating JSON with the user data
      body: JSON.stringify({
        message: this.state.message,
      })
    })
    // Handles API response
    // Checks if it is a success and user was created or if there is an error
    .then((response) => {
      if(response.status === 200){
        console.log("Message has been sent")
        // Empty the message state variable
        this.setState({ message:"" });
        // For page refreshing after new chat is created
        this.getData();
        console.log(this.state.message);
      }else{
        throw "Error";
      }
    })   
    .catch((error) => {
      console.log(error)
    });
  }

  async updateMessage(messageID){

    let to_send = {};

    if(this.state.sendMessage != ""){
        to_send['message'] = this.state.sendMessage
    }
    
    console.log(JSON.stringify(to_send));
    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.currentChatId + "/message/" + messageID,
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
        console.log("Message has been updated");
        // Reseting state for when the modal is used again
        this.setState({ modalVisible: false, selectedMessageId: null });
        this.getData();
      }else if(response.status === 400){
        throw "Please try again"
      }else{
        throw "error"
      }
    })
    .catch((error) => {
      console.log(error)
      this.setState({error: "error"})
      this.setState({submitted: false})
      // Error message will disappear after 5 seconds
      this.setState({errorTimer: setTimeout(() => {
        this.setState({error: null, errorTimer: null})
      }, 5000)})
    });
  }

    // For input validation
    onPressButton(messageID){
      this.setState({submitted: true})
      this.setState({error: ""})

      if(this.state.sendMessage == ""){
          this.setState({error: "Message cannot be empty"})
          // Error message will disappear after 5 seconds
          this.setState({errorTimer: setTimeout(() => {
            this.setState({error: null, errorTimer: null})
          }, 5000)})
          return;
      }
      this.updateMessage(messageID)
    }

    async deleteMessage(messageID){
      return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.currentChatId + "/message/" + messageID,
      {
        method: 'DELETE',
        headers: {
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
        }
      })
      .then((response) => {
          // If the response is ok  
          if(response.status === 200){
              console.log('Message removed successfully');
              // Reseting state for when the modal is used again
              this.setState({ modalVisible: false, selectedMessageId: null });
              this.getData();
          }else if(response.status === 401){
            // Output error on screen for other responses
            throw "Please try again"
          }else{
            throw "error"
          }
        })
        .catch((error) => {
          console.log(error)
          this.setState({error: "error"})
          this.setState({submitted: false})
          // Error message will disappear after 5 seconds
          this.setState({errorTimer: setTimeout(() => {
            this.setState({error: null, errorTimer: null})
          }, 5000)})
        });
    }

    // Converting the millisecond timestamp into a readable date  
    formatDate(timestamp){
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-gb');
    }
    
    // Converting the millisecond timestamp into a readable time
    formatTime(timestamp){
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-GB', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.setChatId()
      .then(() => this.getData())
      .catch((error) => console.log(error));
    })
    this.messageInterval = setInterval(() => {
      this.getData()
    }, 2000)
  }

  componentWillUnmount(){
    this.unsubscribe();
    clearInterval(this.messageInterval);
  }

  render(){
    if(this.state.isLoading){
      return(
        <View style = {styles.container}>
          <ActivityIndicator/>
        </View>
      );
    }else{
      console.log(this.state.chatData)
      return(
        <View style = {styles.container}>
          <View style = {styles.chatDetails}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ChatList')}>
              <Ionicons name="arrow-back" size={32} color="black" style={styles.arrow} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ChatDetails')}>
            <Text style={styles.chatName}>{this.state.chatData.name}</Text>
            <Text style={styles.chatDetailsText}>Click to view and edit chat details</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 660 }}>
            {/* Nested scroll enabled because the flatlist is inside the scrollview */}
            <ScrollView 
              nestedScrollEnabled={true}
              // Setting a reference to scrollview
              ref={(scrollView) => {this.scrollView = scrollView;}}
              // Calling whenever the size changes
              onContentSizeChange={() => {
                // Reverses the scrolview, so bottom to top instead of top to bottom
                // immediately scrolls to the bottom of the flatlist
                this.scrollView.scrollToEnd({ animated: false });
            }}>
              <FlatList
                data={this.state.chatData.messages}
                // For latest messages appearing at the bottom and earlier ones at the top
                inverted={true}
                renderItem={({item}) => {
                  if(this.state.currentUserId == item.author.user_id){
                    return(
                      // Passing the current item in the flatlist into the handleMessage function
                      <TouchableOpacity onPress={() => this.handleMessage(item)}>
                        <View style={styles.sentMessages}>
                          <Text style={styles.nameStyle}>{item.author.first_name + ' ' + item.author.last_name}</Text>
                          <Text style={styles.messageStyle}>{item.message}</Text>
                          <Text style={styles.dateStyle}>{this.formatDate(item.timestamp) + ' ' +this.formatTime(item.timestamp)}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }else{
                    return(
                      <View style = {styles.recievedMessages}>
                        <Text style={styles.nameStyle}>{item.author.first_name + ' ' + item.author.last_name}</Text>
                        <Text style={styles.messageStyle}>{item.message}</Text>
                        <Text style={styles.dateStyle}>{this.formatDate(item.timestamp) + ' ' +this.formatTime(item.timestamp)}</Text>
                      </View>
                    );
                  }
                }}
                keyExtractor={(item) => item.message_id}
              />
            </ScrollView>
          </View>
          <Text>{' '}</Text>
          <View style = {styles.messageContainer}>
            <TextInput style = {styles.textStyle} placeholder = "new message..." onChangeText={message => this.setState({message})} value={this.state.message}></TextInput>
            <TouchableOpacity style = {styles.msgButton} onPress={() => {
              if (this.state.message.trim() === "") {
                return;
              }
              this.newMessage()
              .then(() => this.getData())
              }}
              >
                <Ionicons name="send" size={26} color="black"/>
            </TouchableOpacity>
          </View>
          <Modal 
            visible={this.state.modalVisible}
            animationType='slide'
            transparent={true}
          >
            <View style={styles.modalContainer}>
              {/* Using handlePress(message) so when a message is clicked on it passes that specific message in as the parameter into the text input*/}      
              {console.log("Selected Message ID:", this.state.selectedMessage.message_id)}
              <View style={styles.modalStyle}>
                <TextInput style = {styles.textStyle} placeholder = "Message..." onChangeText={sendMessage => this.setState({sendMessage})} defaultValue={this.state.selectedMessage.message}></TextInput>  
                <Text>{' '}</Text>
                {/* Output error if there is an error */}
                <>
                  {this.state.error && <Text style = {styles.errorMessage}>{this.state.error}</Text>}
                </>
                <View style={styles.buttonContainer}>    
                  <TouchableOpacity style={styles.updateBtn} onPress={() => {this.onPressButton(this.state.selectedMessage.message_id);}}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => {this.deleteMessage(this.state.selectedMessage.message_id);}}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => this.setState({ modalVisible: false})}>
                  <Text style={{color: 'red', textAlign: 'center', fontWeight: 'bold'}}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
  chatDetails:
  {
    marginTop: 8,
    marginLeft: 10,
    marginRight: 15,
    flexDirection: 'row',
    borderBottomWidth: 3,
    width: '98%',
    alignSelf: 'center'
  },
  arrow:
  {
    marginTop: 3,
    marginLeft: 8
  },
  chatName:
  {
    color: '#069139',
    fontWeight: 'bold',
    fontSize: 22,
    marginTop: 5,
    marginLeft: 8
  },
  chatDetailsText:
  {
    marginLeft: 10,
    marginBottom: 5
  },
  sentMessages:
  {
    alignSelf: 'flex-end', 
    width: 170,
    backgroundColor: '#069139',
    borderRadius: 15,
    padding: 8,
    marginTop: 5,
    marginRight: 10,
    overflow: 'hidden'
  },
  recievedMessages:
  {
    width: 170,
    backgroundColor: 'grey',
    borderRadius: 15,
    padding: 8,
    marginTop: 5,
    marginLeft: 10,
    overflow: 'hidden'
  },
  nameStyle:
  {
    fontWeight: 'bold',
    color: 'white'
  },
  messageStyle:
  {
    color:'white'
  },
  dateStyle:
  {
    color: 'white',
    fontSize: 12
  },
  messageContainer:
  {
    flexDirection: 'row',
  },
  textStyle:
  {
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 6,
    width: '92%'
  },
  msgButton:
  {
    marginLeft: 1,
    marginRight: 1,
    marginTop: 3
  },
  modalContainer: 
  {
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStyle: 
  {
    backgroundColor: '#E5E4E2',
    borderRadius: 10,
    padding: 15,
    width: '80%',
    borderColor: '#069139', 
    borderWidth: 3, 
  },
  modalText:
  {
    fontSize: 16,
    textAlign: 'center'
  },
  buttonContainer: {
    flex: 1,
    marginTop: 5,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-around', 
    width: '90%',
  },
  updateBtn: {
    width: '40%',
    borderRadius: 5,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#069139',
    backgroundColor: '#069139'
  },
  deleteBtn: {
    width: '40%',
    borderRadius: 5,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#069139',
    backgroundColor: '#069139'
  },
  
  cancelBtn:
  {
    width: '50%',
    marginTop: 8,
    borderRadius: 5,
    height: 35,
    alignSelf: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'red',
  },
  errorMessage:
  {
    color: 'red',
    textAlign: 'center'
  }
})

export default ConversationDisplay
