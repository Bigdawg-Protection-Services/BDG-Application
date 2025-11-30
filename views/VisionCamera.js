import React, { forwardRef, useEffect, useState } from "react"
import { Camera, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';
import { Dimensions, Text } from 'react-native';


const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height; 

export const VisionCamera = forwardRef((props, cameraRef) => {
    const [hasPermission, setHasPermission] = useState(false);
    const { hasPermission: cameraPermission, requestPermission } = useCameraPermission();

    const devices = useCameraDevices();
    const device = devices.find(d => d.position === 'front') 

    useEffect(() => {
        const checkPermission = async () => {
          const status = await requestPermission(); // Request permission
          setHasPermission(status === 'authorized'); // Set permission status
        };
    
        // Check if permission is already granted on mount
        if (cameraPermission) {
          setHasPermission(true);
        } else {
          checkPermission();
        }
      }, [cameraPermission, requestPermission]);

    if (device == null) return <Text style={{color: 'white', fontSize: 24}}>Loading camera...</Text>;
    if (!hasPermission) return <Text style={{color: 'white', fontSize: 24}}>No camera permission</Text>;

    return <Camera
        ref={cameraRef}
        style={{flex: 1, justifyContent: 'flex-end', alignItems:'center', height:screenHeight*0.8}}
        device={device}
        isActive={true}
        photo={true}
    />
})