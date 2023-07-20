import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, {useState, useEffect} from 'react';
import { hdf5Loader } from './MincLoader';
import { Buffer } from 'buffer';

export default function App() {
  const [token, setToken] = useState(null);
  const [returnData, setReturnData] = useState(null);

  useEffect(() => {
    // Get API key
    var loginData = {
      username : 'admin',
      password : 'demo20!7'
    };
    fetch('https://demo-25-0.loris.ca/api/v0.0.3/login/', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      setToken(data.token);
    })
    .catch((err) => {
      console.log('Here' + err.message);
    });
  }, []);

  useEffect(() => {
    // Get file from LORIS
    if (!token) {
      return;
    }
    //    Fetch in react native does not support ArrayBuffer
    /*
    const headers = { Authorization: 'Bearer ' + token };
    fetch('https://demo-25-0.loris.ca/api/v0.0.3/candidates/587630/V1/images/demo_587630_V1_t2_001_t2-defaced_001.mnc', {headers})
    .then((response) => response.blob())
    .then(async (data) => {
      let arrayBufData = await blobToBuffer(data);
      console.log(typeof(arrayBufData));
      console.log(typeof(data));
      setReturnData(arrayBufData);
      hdf5Loader(arrayBufData);
    })
    .catch((err) => {
      console.log(err.message);
    });
    */
    const req = new XMLHttpRequest();
    req.open('GET', 'https://demo-25-0.loris.ca/api/v0.0.3/candidates/587630/V1/images/demo_587630_V1_t2_001_t2-defaced_001.mnc', true);
    req.responseType = "arraybuffer";
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.onload = (evt) => {
        console.log(typeof req.response);
        console.log(req.response);
        hdf5Loader(req.response);

    };
    req.send(null);
  }, [token]);

  function blobToBuffer(blob) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = reject;
          reader.onload = () => {
            console.log('onload blobToBuffer');
              const data = reader.result.slice(reader.result.indexOf('base64,') + 7);
              console.log('Resolving promise');
              resolve(Buffer.from(data, 'base64'));
          };
          reader.readAsDataURL(blob);
      });
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
