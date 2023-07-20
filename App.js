import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, {useState, useEffect} from 'react';
// import nifti from 'nifti-reader-js';

export default function App() {
  const [token, setToken] = useState(null);
  const [returnData, setReturnData] = useState(null);

  useEffect(() => {
    // Get API key
    var loginData = {
      username : // username 
      password : // password
    };
    fetch('https://cbeaudoin-test-25.loris.ca/api/v0.0.3/login/', {
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
    const headers = { Authorization: 'Bearer ' + token };
    fetch('https://cbeaudoin-test-25.loris.ca/api/v0.0.3/candidates/400184/V2/images/Loris-MRI_400184_V2_fMRI_001.nii', {headers})
    .then((response) => response.text())
    .then((data) => {
      console.log('a');
      setReturnData(data);
    })
    .catch((err) => {
      console.log('here2'+err.message);
    });
  }, [token]);

  // var niftiHeader = null,
  //     niftiImage = null,
  //     niftiExt = null;

  // if (nifti.isCompressed(returnData)) {
  //     returnData = nifti.decompress(returnData);
  // }

  // if (nifti.isNIFTI(returnData)) {
  //     niftiHeader = nifti.readHeader(returnData);
  //     console.log(niftiHeader.toFormattedString());
  //     niftiImage = nifti.readImage(niftiHeader, returnData);
      
  //     if (nifti.hasExtension(niftiHeader)) {
  //         niftiExt = nifti.readExtensionData(niftiHeader, returnData);
  //     }
  // }

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
