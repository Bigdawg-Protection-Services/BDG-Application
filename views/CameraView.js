import React, { Component } from 'react';
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
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);
dayjs.locale('en');
import Geolocation from 'react-native-geolocation-service';
// import Geocoder from 'react-native-geocoding';
import { VisionCamera } from './VisionCamera';
import { GOOGLE_MAPS_API_KEY } from '../res/data/Environment';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class CameraView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isTakingPic: false,
            capturedImageUri: null,
            imageTaken: false,
            curStamp: dayjs().format('LL | LTS'),
            saveStamp: '',
            address1: 'Loading ...',
            address2: '',
        }
        this.viewShot = React.createRef();
        this.camera2Ref = React.createRef(null);
        this.clockTimer = null;
        this.locationFallbackTimer = null;
    }
    async componentDidMount() {
        // Geocoder initialization removed
        const hasPermission = await this.hasLocationPermission();
        if (hasPermission) {
            this.getGeoLocation()
            this.locationFallbackTimer = setTimeout(() => {
                if (this.state.address1 === 'Loading ...') {
                    this.setState({
                        address1: 'Location unavailable',
                        address2: 'Please check GPS or internet'
                    });
                }
            }, 18000);
        } else {
            // Set error message if permission denied
            this.setState({
                address1: 'Location permission denied',
                address2: 'Please enable location in settings'
            })
        }
        this.runTimeLoop()
    }
    componentWillUnmount() {
        if (this.clockTimer) {
            clearInterval(this.clockTimer);
        }
        if (this.locationFallbackTimer) {
            clearTimeout(this.locationFallbackTimer);
        }
    }
    async getGeoLocation(retryCount = 0) {
        const maxRetries = 3;

        Geolocation.getCurrentPosition(
            async (position) => {
                const lat = position?.coords?.latitude;
                const lng = position?.coords?.longitude;
                if (typeof lat !== 'number' || typeof lng !== 'number') {
                    this.setState({
                        address1: 'Location unavailable',
                        address2: ''
                    });
                    return;
                }

                // Show coordinates as fallback
                const coordFallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                this.setState({
                    address1: coordFallback,
                    address2: 'Locating address...'
                });

                // Prefer Google Geocoding for reliability; fallback to OSM if needed.
                try {
                    if (GOOGLE_MAPS_API_KEY) {
                        const googleResponse = await axios.get(
                            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=en`,
                            { timeout: 7000 }
                        );

                        const first = googleResponse?.data?.results?.[0];
                        if (first) {
                            const comps = first.address_components || [];
                            const getComp = (type) => comps.find(c => c.types && c.types.includes(type))?.long_name || '';

                            const streetNumber = getComp('street_number');
                            const route = getComp('route');
                            const locality = getComp('locality') || getComp('postal_town') || getComp('sublocality') || getComp('administrative_area_level_2');
                            const state = getComp('administrative_area_level_1');
                            const postalCode = getComp('postal_code');

                            const part1 = [streetNumber, route].filter(Boolean).join(' ').trim() || first.formatted_address || coordFallback;
                            const part2 = [locality, state, postalCode].filter(Boolean).join(', ') || 'Address unavailable';

                            this.setState({
                                address1: part1,
                                address2: part2
                            });
                            return;
                        }
                    }

                    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                        headers: {
                            'User-Agent': 'BDG-Mobile-App/1.0'
                        },
                        timeout: 7000
                    });

                    if (response.data && response.data.address) {
                        const addr = response.data.address;
                        let part1 = '';
                        if (addr.road) part1 += addr.road;
                        else if (addr.pedestrian) part1 += addr.pedestrian;
                        else if (addr.suburb) part1 += addr.suburb;
                        if (addr.house_number) part1 = addr.house_number + ' ' + part1;

                        let part2 = '';
                        if (addr.city) part2 += addr.city;
                        else if (addr.town) part2 += addr.town;
                        else if (addr.village) part2 += addr.village;
                        else if (addr.county) part2 += addr.county;
                        if (addr.state) part2 += (part2 ? ', ' : '') + addr.state;

                        this.setState({
                            address1: part1 || coordFallback,
                            address2: part2 || 'Address unavailable'
                        });
                    } else {
                        this.setState({
                            address1: coordFallback,
                            address2: 'Address unavailable'
                        });
                    }
                } catch (error) {
                    console.warn('Reverse geocoding error:', error);
                    this.setState({
                        address1: coordFallback,
                        address2: 'Address lookup timed out'
                    })
                }

            },
            (error) => {
                console.log('Location error:', error.code, error.message);

                // Update UI with error message
                let errorMsg = 'Location unavailable';
                if (error.code === 1) {
                    errorMsg = 'Location permission denied';
                } else if (error.code === 2) {
                    errorMsg = 'Location unavailable';
                } else if (error.code === 3) {
                    errorMsg = 'Location timeout';
                    // Retry on timeout
                    if (retryCount < maxRetries) {
                        setTimeout(() => {
                            this.getGeoLocation(retryCount + 1);
                        }, 2000);
                        return;
                    }
                }

                this.setState({
                    address1: errorMsg,
                    address2: ''
                })
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000, forceRequestLocation: true, showLocationDialog: true }
        )
    }
    async runTimeLoop() {
        this.clockTimer = setInterval(() => {
            this.setState({
                curStamp: dayjs().format('LL | LTS')
            })
        }, 1000)
    }

    takePicture = async () => {
        if (this.camera && !this.state.isTakingPic) {
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
                console.log('Error taking picture : ', err.message || err)
                return;
            } finally {
                this.setState({ takingPic: false });
            }
        }
    }

    takeVisionPhoto = async () => {
        if (this.camera2Ref.current) {
            this.setState({ takingPic: true });
            try {
                const photo = await this.camera2Ref.current.takePhoto();
                const uri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
                this.setState({
                    capturedImageUri: uri,
                    saveStamp: this.state.curStamp,
                    takingPic: false,
                    imageTaken: true
                })
            } catch (err) {
                Toast.show('Error', Toast.LONG);
            }
        }
    };

    addMarker(uri) {
        try {
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
                    console.log('Marker success : file://', path)
                    this.setState({
                        capturedImageUri: Platform.OS === 'android' ? 'file://' + path : path,
                    })
                }).catch(err => {
                    console.log('Marker Error : ', err)
                })
        } catch (e) {
            console.log('Error caught is : ', e)
        }
    }
    async hasLocationPermission() {
        if (Platform.OS == 'android') {
            const permission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
            const hasPermission = await PermissionsAndroid.check(permission);
            if (hasPermission) {
                return true;
            }

            const status = await PermissionsAndroid.request(permission, {
                title: "BDG requires Location Access",
                message: "App needs access to Location for timestamp",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            });
            if (status === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the Location")
                return true;
            } else {
                console.log("Location permission denied");
                return false;
            }
        } else {
            // iOS
            const authStatus = await Geolocation.requestAuthorization('always');
            if (authStatus === 'granted' || authStatus === 'authorized') {
                return true;
            } else {
                this.setState({
                    address1: 'Location permission denied',
                    address2: 'Please enable location in settings'
                });
                return false;
            }
        }
    }
    async hasSavingPermission() {
        if (Platform.OS == 'android') {
            const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
            const hasPermission = await PermissionsAndroid.check(permission);
            if (hasPermission) {
                return true;
            }

            const status = await PermissionsAndroid.request(permission, {
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
        if (Platform.OS == 'android') {
            const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
            const hasPermission = await PermissionsAndroid.check(permission);
            if (hasPermission) {
                return true;
            }

            const status = await PermissionsAndroid.request(permission, {
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
    async savePictureToCameraRoll() {
        // console.log('Filepath to save is : ',this.state.capturedImageUri)
        // CameraRoll.save(this.state.capturedImageUri)
        // .then(()=>{
        //     console.log('Image saved successfully : ')
        // })
        // .catch(err => {
        //     console.log('Image save erro : ',err)
        // })
        this.viewShot.current.capture().then(uri => {
            console.log('Snapshot captured is : ', uri)
            CameraRoll.save(uri)
                .then(() => {
                    console.log('Image saved successfully : ')
                    Toast.show('Image saved', Toast.LONG);
                    this.props.navigation.goBack()
                })
                .catch(err => {
                    console.log('Image save erro : ', err)
                })
        })
    };

    render() {
        return (
            <View style={{ height: screenHeight * 1.05, backgroundColor: 'black' }}>
                <StatusBar translucent backgroundColor="transparent" barStyle='dark-content' />
                {/* <View style={{marginTop:screenHeight*0.05}} /> */}

                <VisionCamera ref={this.camera2Ref} />

                {
                    this.state.capturedImageUri == null &&
                    <View style={{
                        width: screenWidth, height: Platform.OS === 'ios' ? screenHeight * 0.25 : screenHeight * 0.2,
                        backgroundColor: 'black', justifyContent: 'center', zIndex: 10
                    }}>
                        {/* <Image source={{uri: this.state.capturedImageUri}} width={screenWidth} height={screenHeight} /> */}
                        {
                            <TouchableOpacity onPress={() => {
                                this.takeVisionPhoto()
                            }} style={{
                                width: screenWidth * 0.2, height: screenWidth * 0.2, borderRadius: screenWidth * 0.2, backgroundColor: 'white',
                                alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 10
                            }}>
                                <View style={{
                                    width: screenWidth * 0.15, height: screenWidth * 0.15, borderRadius: screenWidth * 0.15, borderColor: 'black', borderWidth: 2,
                                }}>
                                </View>
                            </TouchableOpacity>
                        }
                    </View>
                }

                {/* WaterMark Preview */}
                <View style={{ width: screenWidth, height: screenHeight, position: 'absolute' }}>
                    <Image
                        source={require('../res/img/logo.png')}
                        style={{ width: 100, height: 100, marginTop: screenHeight * 0.65, marginLeft: 20 }}
                        resizeMode="contain" />

                    <TouchableOpacity onPress={() => {
                        this.props.navigation.goBack()
                    }} style={{ position: 'absolute', left: 15, top: screenHeight * 0.08 }}>
                        <MaterialIcon name="clear" size={32} color="white" style={{
                            textShadowColor: 'rgba(0, 0, 0, 1.0)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
                        }} />
                    </TouchableOpacity>

                    <View style={{ position: 'absolute', right: 0, padding: 20, top: screenHeight * 0.05, width: screenWidth * 0.7 }}>
                        {/* <Text style={{color:'white', fontSize:20}}>TimeStamp</Text> */}
                        <Text style={{
                            color: 'white', fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 1.0)',
                            textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
                        }}>
                            {this.state.curStamp}
                        </Text>
                        <Text style={{
                            color: 'white', fontSize: 16, marginTop: 7, textShadowColor: 'rgba(0, 0, 0, 1.0)',
                            textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
                        }}>
                            {this.state.address1}
                        </Text>
                        <Text style={{
                            color: 'white', fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 1.0)',
                            textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
                        }}>
                            {this.state.address2}
                        </Text>
                    </View>

                </View>

                {
                    this.state.imageTaken == true &&
                    <View style={{ width: screenWidth, height: screenHeight * 1.05, position: 'absolute', backgroundColor: 'black' }}>
                        <ViewShot ref={this.viewShot} options={{ format: 'jpg', quality: 0.9 }}>
                            <Image
                                //source={require('../res/img/logo.png')}
                                source={{ uri: this.state.capturedImageUri }}
                                style={{ width: screenWidth, height: screenHeight * 0.8 }}
                                resizeMode='cover' />

                            <Image
                                source={require('../res/img/logo.png')}
                                style={{ width: 100, height: 100, marginTop: screenHeight * 0.65, marginLeft: 20, position: 'absolute' }}
                                resizeMode="contain" />

                            <View style={{ position: 'absolute', right: 0, top: 30, padding: 15, width: screenWidth * 0.7 }}>
                                <Text style={{
                                    color: 'white', fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 1.0)',
                                    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
                                }}>
                                    {this.state.saveStamp}
                                </Text>
                                <Text style={{
                                    color: 'white', fontSize: 14, marginTop: 10, textShadowColor: 'rgba(0, 0, 0, 1.0)',
                                    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
                                }}>
                                    {this.state.address1}
                                </Text>
                                <Text style={{
                                    color: 'white', fontSize: 14, textShadowColor: 'rgba(0, 0, 0, 1.0)',
                                    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
                                }}>
                                    {this.state.address2}
                                </Text>
                            </View>
                        </ViewShot>

                        {
                            this.state.capturedImageUri == null &&
                            <View style={{
                                backgroundColor: '#000', width: screenWidth, height: screenHeight * 0.8,
                                position: 'absolute', justifyContent: 'center', alignItems: 'center'
                            }}>
                                <Text style={{ fontSize: 28, fontWeight: '800', color: 'white', marginBottom: 30 }}>Loading ..</Text>
                                <View style={{ position: 'absolute', right: 0, top: 30, padding: 15, width: screenWidth * 0.7 }}>
                                    <Text style={{
                                        color: 'white', fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 1.0)',
                                        textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
                                    }}>
                                        {this.state.curStamp}
                                    </Text>
                                    <Text style={{
                                        color: 'white', fontSize: 14, marginTop: 10, textShadowColor: 'rgba(0, 0, 0, 1.0)',
                                        textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
                                    }}>
                                        {this.state.address1}
                                    </Text>
                                    <Text style={{
                                        color: 'white', fontSize: 14, textShadowColor: 'rgba(0, 0, 0, 1.0)',
                                        textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
                                    }}>
                                        {this.state.address2}
                                    </Text>
                                </View>
                            </View>
                        }

                        <TouchableOpacity onPress={() => {
                            this.setState({ imageTaken: false, capturedImageUri: null })
                        }} style={{
                            width: 80, height: 80, borderRadius: 100, backgroundColor: '#a00', position: 'absolute',
                            justifyContent: 'center', alignItems: 'center', bottom: 50, left: 50, zIndex: 11
                        }}>
                            <MaterialIcon name="clear" color="#fff" size={26} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            if (this.hasSavingPermission()) {
                                this.savePictureToCameraRoll()
                            }
                        }} style={{
                            width: 80, height: 80, borderRadius: 100, backgroundColor: '#0a0', position: 'absolute',
                            justifyContent: 'center', alignItems: 'center', bottom: 50, right: 50, zIndex: 11
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
        width: screenWidth,
        height: screenHeight,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#000c'
    },
    modalView: {
        backgroundColor: "#eee",
        borderRadius: 10,
        paddingVertical: 35,
        width: screenWidth * 0.85,
    },
});

export default CameraView;
