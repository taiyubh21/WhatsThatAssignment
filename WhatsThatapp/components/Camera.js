import { Camera, CameraType, onCameraReady, CameraPictureOptions } from 'expo-camera';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CameraSendToServer({navigation}) {
    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [camera, setCamera] = useState(null);

    function toggleCameraType(){
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
        console.log("Camera: ", type)
    }

    async function takePhoto(){
        if(camera){
            const options = {quality: 0.5, base64: true, onPictureSaved: (data) => sendToServer(data)}
            const data = await camera.takePictureAsync(options)
        }
    }

    async function sendToServer(data){
        console.log("HERE", data.uri)

        let id = await AsyncStorage.getItem("whatsthat_user_id");
        let token = await AsyncStorage.getItem("whatsthat_session_token");

        let res = await fetch(data.uri);
        let blob = await res.blob()

        console.log("User ID:" + id);

        return fetch("http://localhost:3333/api/1.0.0/user/"+ id + "/photo", {
            method: "POST",
            headers: {
                'Content-Type': 'image/png',
                "X-Authorization": token
            },
            body: blob
        })
        .then((response) => {
            if(response.status === 200){
              console.log("Image has been updated")
              navigation.navigate("UserProfileDisplay")
            }else{
              throw "Error"
            }
        })
        .catch((err) => {
            console.log(err)
        })
    }

    function requestCameraPermission() {
        requestPermission();
      }

    if(!permission || !permission.granted){
        return (
        <View>
            <Text>No access to camera</Text>
            <TouchableOpacity onPress={requestCameraPermission}>
                <Text>Request Camera Permission</Text>
            </TouchableOpacity>
        </View>
        )
        
    }else{
        return (
            <View style={styles.container}>
                <Camera style={styles.camera} type={type} ref={ref => setCamera(ref)}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
                            <Text style={styles.text}>Flip Camera</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={takePhoto}>
                            <Text style={styles.text}>Take Photo</Text>
                        </TouchableOpacity>
                    </View>
                </Camera>
            </View>
        );
    } 
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    buttonContainer: {
        alignSelf: 'flex-end',
        padding: 5,
        margin: 5,
        backgroundColor: 'steelblue'
    },
    button: {
        width: '100%',
        height: '100%'
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ddd'
    }
})