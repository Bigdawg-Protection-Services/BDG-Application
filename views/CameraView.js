import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Toast from 'react-native-simple-toast';
const axios = require('axios').default;

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Marker, { ImageFormat } from 'react-native-image-marker';
var RNFS = require('react-native-fs');
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import ViewShot from "react-native-view-shot";
var moment = require('moment');
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import { VisionCamera } from './VisionCamera';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class CameraView extends Component {
    constructor(props){
        super(props);
        this.state = {
            isTakingPic : false,
            capturedImageUri: null,
            imageTaken: false,
            curStamp: moment().format('LL | LTS'),
            saveStamp: '',
            address1: 'Loading ...',
            address2: '',
        }
        this.viewShot = React.createRef();
        this.camera2Ref = React.createRef(null);
    }
    componentDidMount(){
        if(Geocoder?.apiKey == null){
            // GeoLocation Production KEY
            Geocoder.init("GEOLOCATION_KEY");
        }
        if (this.hasLocationPermission()) {
            this.getGeoLocation()
        }
        this.runTimeLoop()
    }
    getGeoLocation(){
        Geolocation.getCurrentPosition(
            (position) => 
            {   
                Geocoder.from(position?.coords?.latitude, position?.coords?.longitude)
                .then(json => {
                    var addressComponent = json.results[0].address_components
                    let address1='', address2='';
                    for(let comp in addressComponent){
                        if(parseInt(comp) < 3){
                            if(parseInt(comp)==0)
                                address1 += addressComponent[comp]?.short_name+' '
                            else
                                address1 += addressComponent[comp]?.short_name+', '
                        }
                        if(parseInt(comp) >= 5){
                            if(parseInt(comp) == 7){
                                address2 += addressComponent[comp]?.short_name
                            }else {
                                address2 += addressComponent[comp]?.short_name+', '
                            }
                        }
                    }
                    this.setState({
                        address1: address1,
                        address2: address2
                    })
                })
                .catch(error => {
                    console.warn('Postal code error is : ',error)
                })

            },
            (error) => {
              console.log('Location error is : ',error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        )
    }
    async runTimeLoop(){
        setInterval(() => {
            this.setState({
                curStamp : moment().format('LL | LTS')
            })
        }, 1000)
    }

    takePicture = async() => {
        if( this.camera && !this.state.isTakingPic ){
            let options = {
                quality: 1.0,
                fixOrientation: true,
                forceUpOrientation: true, 
                mirrorImage: true,
                writeExif: true,
                base64: true
            };
            this.setState({ takingPic: true });

            try {
                const data = await this.camera.takePictureAsync(options);
                console.log('Image taken success : ', data.uri);
                this.setState({
                    capturedImageUri: data.uri,
                    saveStamp: this.state.curStamp
                })
                //this.addMarker(data.uri)
            } catch (err) {
               console.log('Error taking picture : ',err.message || err)
               return;
            } finally {
               this.setState({takingPic: false});
            }
        }
    }

    takeVisionPhoto = async() => {
        if (this.camera2Ref.current) {
            this.setState({ takingPic: true });
            try{
                const photo = await this.camera2Ref.current.takePhoto();
                const uri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
                this.setState({
                    capturedImageUri: uri,
                    saveStamp: this.state.curStamp,
                    takingPic: false,
                    imageTaken: true
                })
            }catch(err){
                Toast.show('Error',Toast.LONG);
            }
        }
    };

    addMarker(uri){
        try{
            Marker.markImage({
                src: uri, 
                markerSrc: require('../res/img/logo.png'), 
                //position: 'bottomLeft',  // topLeft, topCenter,topRight, bottomLeft, bottomCenter , bottomRight, center
                X: 130,
                Y: 1100,
                scale: 1, 
                markerScale: 0.21, 
                quality: 100,
                filename: new Date().toISOString().concat('.png'),
                saveFormat: ImageFormat.png,
                //maxSize: 10
            })
            .then(path => {
                console.log('Marker success : file://',path)
                this.setState({
                    capturedImageUri: Platform.OS === 'android' ? 'file://' + path : path,
                })
            }).catch(err => {
                console.log('Marker Error : ',err)
            })
        }catch(e){
            console.log('Error caught is : ',e)
        }
    }
    async hasLocationPermission(){
        if(Platform.OS == 'android'){
            const permission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
            const hasPermission = await PermissionsAndroid.check(permission);
            if (hasPermission) {
            return true;
            }
        
            const status = await PermissionsAndroid.request(permission,{
                title: "BDG requires Location Access",
                message: "App needs access to Location for timestamp",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            });
            if (status === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the Location")
                this.getGeoLocation()
                return true;
            } else {
                console.log("Location permission denied");
                return false;
            }
        }else {
            Geolocation.requestAuthorization('always')
        }
    }
    async hasSavingPermission() {
        if(Platform.OS == 'android'){
            const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
            const hasPermission = await PermissionsAndroid.check(permission);
            if (hasPermission) {
            return true;
            }
        
            const status = await PermissionsAndroid.request(permission,{
                title: "BDG requires Storage Access",
                message: "App needs access to take timestamp for sign in",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            });
            //return status === 'granted';
            if (status === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the Storage");
                return true;
            } else {
                console.log("Storage permission denied");
                return false;
            }
        }
    }
    async hasReadingPermission() {
        if(Platform.OS == 'android'){
            const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
            const hasPermission = await PermissionsAndroid.check(permission);
            if (hasPermission) {
            return true;
            }
        
            const status = await PermissionsAndroid.request(permission,{
                title: "BDG requires Storage Access",
                message: "App needs access to take timestamp for sign in",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            });
            //return status === 'granted';
            if (status === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the Storage");
                return true;
            } else {
                console.log("Storage permission denied");
                return false;
            }
        }
    }
    async  savePictureToCameraRoll() {
        // console.log('Filepath to save is : ',this.state.capturedImageUri)
        // CameraRoll.save(this.state.capturedImageUri)
        // .then(()=>{
        //     console.log('Image saved successfully : ')
        // })
        // .catch(err => {
        //     console.log('Image save erro : ',err)
        // })
        this.viewShot.current.capture().then(uri => {
            console.log('Snapshot captured is : ',uri)
            CameraRoll.save(uri)
            .then(()=>{
                console.log('Image saved successfully : ')
                Toast.show('Image saved',Toast.LONG);
                this.props.navigation.goBack()
            })
            .catch(err => {
                console.log('Image save erro : ',err)
            })
        })
    };

    render(){
        return(
            <View style={{height:screenHeight*1.05, backgroundColor:'black'}}>
                    <StatusBar translucent backgroundColor="transparent" barStyle='dark-content' />
                    {/* <View style={{marginTop:screenHeight*0.05}} /> */}

                    <VisionCamera ref={this.camera2Ref} />  

                    {
                        this.state.capturedImageUri == null &&
                        <View style={{ width:screenWidth, height: Platform.OS==='ios'?screenHeight*0.25:screenHeight*0.2, 
                            backgroundColor:'black', justifyContent:'center', zIndex:10 
                        }}>
                            {/* <Image source={{uri: this.state.capturedImageUri}} width={screenWidth} height={screenHeight} /> */}
                            {
                                <TouchableOpacity onPress={()=>{
                                    this.takeVisionPhoto()
                                }} style={{width:screenWidth*0.2, height:screenWidth*0.2, borderRadius:screenWidth*0.2, backgroundColor:'white', 
                                    alignSelf:'center', justifyContent:'center', alignItems:'center', marginBottom:10
                                }}>
                                    <View style={{
                                        width:screenWidth*0.15, height:screenWidth*0.15, borderRadius:screenWidth*0.15, borderColor:'black', borderWidth:2,
                                    }}>
                                    </View>
                                </TouchableOpacity>
                            }
                        </View>
                    }

                    {/* WaterMark Preview */}
                    <View style={{width:screenWidth, height:screenHeight, position:'absolute'}}>
                        <Image 
                        source={require('../res/img/logo.png')} 
                        style={{width:100, height:100, marginTop: screenHeight*0.65, marginLeft:20}} 
                        resizeMode="contain"/>

                        <TouchableOpacity onPress={()=>{
                            this.props.navigation.goBack()
                        }} style={{position:'absolute', left:15, top:screenHeight*0.08}}>
                            <MaterialIcon name="clear" size={32} color="white" style={{
                                textShadowColor: 'rgba(0, 0, 0, 1.0)', textShadowOffset: { width: 1, height: 1 },textShadowRadius: 2,
                            }} />
                        </TouchableOpacity>
                        
                        <View style={{position:'absolute', right:0, padding:20, top:screenHeight*0.05, width:screenWidth*0.7}}>
                            {/* <Text style={{color:'white', fontSize:20}}>TimeStamp</Text> */}
                            <Text style={{color:'white', fontSize:16, textShadowColor: 'rgba(0, 0, 0, 1.0)', 
                                textShadowOffset: { width: 1, height: 1 },textShadowRadius: 2,
                            }}>
                                {this.state.curStamp}
                            </Text>
                            <Text style={{color:'white', fontSize:16, marginTop:7, textShadowColor: 'rgba(0, 0, 0, 1.0)', 
                                textShadowOffset: { width: 1, height: 1 },textShadowRadius: 2,
                            }}> 
                                {this.state.address1}
                            </Text>
                            <Text style={{color:'white', fontSize:16, textShadowColor: 'rgba(0, 0, 0, 1.0)',
                                textShadowOffset: { width: 1, height: 1 },textShadowRadius: 2,
                            }}> 
                                {this.state.address2}
                            </Text>
                        </View>
                    
                    </View>

                    {
                        this.state.imageTaken == true &&
                        <View style={{width:screenWidth, height:screenHeight*1.05, position:'absolute', backgroundColor:'black'}}>
                            <ViewShot ref={this.viewShot} options={{format: 'jpg', quality: 0.9}}>
                                <Image
                                //source={require('../res/img/logo.png')}
                                source={{uri: this.state.capturedImageUri}}
                                style={{width:screenWidth, height:screenHeight*0.8}} 
                                resizeMode='cover'/>

                                <Image 
                                source={require('../res/img/logo.png')} 
                                style={{width:100, height:100, marginTop: screenHeight*0.65, marginLeft:20, position:'absolute'}} 
                                resizeMode="contain"/>

                                <View style={{position:'absolute', right:0, top:30, padding:15,  width:screenWidth*0.7}}>
                                    <Text style={{color:'white', fontSize:16, textShadowColor: 'rgba(0, 0, 0, 1.0)', 
                                        textShadowOffset: { width: 1, height: 1 },textShadowRadius: 2,
                                    }}>
                                        {this.state.saveStamp}
                                    </Text>
                                    <Text style={{color:'white', fontSize:14, marginTop:10, textShadowColor: 'rgba(0, 0, 0, 1.0)', 
                                        textShadowOffset: { width: 1, height: 1 },textShadowRadius: 2,
                                    }}> 
                                        {this.state.address1}
                                    </Text>
                                    <Text style={{color:'white', fontSize:14, textShadowColor: 'rgba(0, 0, 0, 1.0)',
                                        textShadowOffset: { width: 1, height: 1 },textShadowRadius: 2,
                                    }}> 
                                        {this.state.address2}
                                    </Text>
                                </View>
                            </ViewShot>

                            {
                                this.state.capturedImageUri == null &&
                                <View style={{backgroundColor:'#000', width:screenWidth, height:screenHeight*0.8, 
                                    position:'absolute', justifyContent:'center', alignItems:'center'
                                }}>
                                    <Text style={{fontSize:28, fontWeight:'800', color:'white'}}>Loading ..</Text>
                                </View>
                            }

                            <TouchableOpacity onPress={()=>{
                                this.setState({ imageTaken: false, capturedImageUri: null })
                            }} style={{width:80, height:80, borderRadius:100, backgroundColor:'#a00', position:'absolute', 
                                justifyContent:'center', alignItems:'center', bottom:50, left:50, zIndex:11
                            }}>
                                <MaterialIcon name="clear" color="#fff" size={26} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={()=>{
                                if(this.hasSavingPermission()){
                                    this.savePictureToCameraRoll()
                                }
                            }} style={{width:80, height:80, borderRadius:100, backgroundColor:'#0a0', position:'absolute', 
                                justifyContent:'center', alignItems:'center', bottom:50, right:50, zIndex:11
                            }}>
                                <MaterialIcon name="check" color="#fff" size={26} />
                            </TouchableOpacity>
                        </View>
                    }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    centeredView: {
        width:screenWidth,
        height: screenHeight,  
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:'#000c'
    },
    modalView: {
      backgroundColor: "#eee",
      borderRadius: 10,
      paddingVertical: 35,
      width: screenWidth*0.85,
    },
});

export default CameraView;