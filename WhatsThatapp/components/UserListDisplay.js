import React, { Component } from 'react';
import { FlatList, View, ActivityIndicator, Text } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';


 class UserListDisplay extends Component {
    constructor(props){
        super(props);
        this.state = {
            isLoading: true,
            userListData: [],
            currentUserId: null
        };
        this.setCurrentUserId();
    }

    async setCurrentUserId() {
        const userId = await AsyncStorage.getItem("whatsthat_user_id");
        this.setState({ currentUserId: userId });
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
                    data={this.state.userListData.filter((user) => user.user_id !== this.state.currentUserId)}                  
                    renderItem= {({item}) => (
                        <View key={item.id}>
                            <Text>{item.given_name + ' ' + item.family_name}</Text> 
                            <Text>{item.email}</Text> 
                            <Text>{' '}</Text>
                        </View>
                    )}
                    keyExtractor={(item) => item.user_id.toString()}
                />
            </View>
        );
    }

}
}

export default UserListDisplay