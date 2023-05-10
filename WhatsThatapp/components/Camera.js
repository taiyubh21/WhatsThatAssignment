/* eslint-disable react/jsx-no-bind */
import { Camera, CameraType } from 'expo-camera';
import React, { useState } from 'react';
import {
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CameraSendToServer({ navigation }) {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState(null);

  function toggleCameraType() {
    setType((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
    console.log('Camera: ', type);
  }

  async function takePhoto() {
    if (camera) {
      const options = { quality: 0.5, base64: true, onPictureSaved: (data) => sendToServer(data) };
      // eslint-disable-next-line no-unused-vars
      const data = await camera.takePictureAsync(options);
    }
  }

  async function sendToServer(data) {
    console.log('HERE', data.uri);

    const id = await AsyncStorage.getItem('whatsthat_user_id');
    const token = await AsyncStorage.getItem('whatsthat_session_token');

    const res = await fetch(data.uri);
    const blob = await res.blob();

    console.log(`User ID:${id}`);

    return fetch(`http://localhost:3333/api/1.0.0/user/${id}/photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
        'X-Authorization': token,
      },
      body: blob,
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('Image has been updated');
          navigation.navigate('UserProfileDisplay');
        } else {
          throw new Error('error');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function requestCameraPermission() {
    requestPermission();
  }

  if (!permission || !permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.camera}>
          <Text style={{ fontSize: 18 }}>No access to camera</Text>
          <TouchableOpacity
            onPress={requestCameraPermission}
            style={styles.cameraPermission}
          >
            <Text style={styles.permissionText}>Request Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.containers}>
      <Camera style={styles.camera} type={type} ref={(ref) => setCamera(ref)}>
        <TouchableOpacity style={styles.reverse} onPress={toggleCameraType}>
          <Ionicons name="camera-reverse" size={40} color="steelblue" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.photo} onPress={takePhoto}>
          <Ionicons name="ellipse" size={50} color="steelblue" />
        </TouchableOpacity>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    borderWidth: 3,
    margin: 5,
    borderRadius: 15,
    borderColor: '#069139',
    backgroundColor: '#E5E4E2',
  },
  containers:
  {
    flex: 1,
  },
  reverse:
  {
    alignSelf: 'flex-end',
    padding: 5,
    margin: 5,
  },
  photo:
  {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  camera:
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPermission:
  {
    width: '70%',
    borderRadius: 5,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 3,
    borderColor: '#069139',
    backgroundColor: '#069139',
  },
  permissionText:
  {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
