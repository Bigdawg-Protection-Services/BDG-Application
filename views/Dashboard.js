/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  View,
  Text,
  Image,
  StatusBar,
  Modal,
  ImageBackground,
  Dimensions,
  PermissionsAndroid,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import URL from '../res/data/Environment';
const axios = require('axios').default;
import Geolocation from 'react-native-geolocation-service';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onlineStatus: false,
      showClockMenu: false,
      userId: '',
      userName: '',
      userEmail: '',
      userPhone: '',
      userAddress: '',
      userBadge: '',
      loaderVisible: false,
      userShift: 0,
      todayDate: '',
    };
  }
  componentDidMount() {
    this.readSavedData();
    this.props.navigation.addListener('focus', () => {
      //this.getUser()
      this.readSavedData();
    });

    this.getUser();
    let dd = new Date().toDateString();
    this.setState({
      todayDate: dd,
    });

    this.checkCameraPermission();
    this.hasLocationPermission();
  }
  async readSavedData() {
    try {
      let id = await AsyncStorage.getItem('@userId');
      let name = await AsyncStorage.getItem('@userName');
      let email = await AsyncStorage.getItem('@userEmail');
      let phone = await AsyncStorage.getItem('@userPhone');
      let address = await AsyncStorage.getItem('@userAddress');
      let badge = await AsyncStorage.getItem('@userBadge');

      this.setState({
        userId: id,
        userName: name,
        userEmail: email,
        userPhone: phone,
        userAddress: address,
        userBadge: badge,
      });
    } catch (e) {
      console.log('Token reading error ...', e);
    }
  }
  async getUser() {
    this.setState({loaderVisible: true});

    let token = '',
      id = '';
    try {
      token = await AsyncStorage.getItem('@loginToken');
      id = await AsyncStorage.getItem('@userId');
      // if(token !== null) {
      //     console.log('Token read is : ',token,' : ',id)
      // }
    } catch (e) {
      console.log('Token reading error ...', e);
    }

    let url = URL.concat('api/users/').concat(id);
    axios
      .get(url, {
        headers: {
          Authorization: 'Bearer '.concat(token),
        },
      })
      .then(response => {
        let shiftStatus = parseInt(response.data?.data?.doc?.shift);
        this.setState({
          loaderVisible: false,
          userShift: response.data?.data?.doc?.shift,
          onlineStatus: shiftStatus == 1 ? true : false,
          showClockMenu: shiftStatus == 0 ? true : false,
        });
      })
      .catch(error => {
        if (
          ''.concat(error).includes('403') ||
          ''.concat(error).includes('500')
        ) {
          Toast.show('Please Login again !!', Toast.LONG);
          this.removeLoggedInCheck();
          this.props.navigation.navigate('Authenticate');
        }
        this.setState({loaderVisible: false});
      });
  }
  clockInCall() {
    this.setState({loaderVisible: true});
    let url = URL.concat('api/checker/in');
    axios
      .post(url, {
        user: this.state.userId,
      })
      .then(response => {
        this.setState({
          loaderVisible: false,
          onlineStatus: true,
        });
        Toast.show('Clocked IN successfull', Toast.LONG);
      })
      .catch(error => {
        Toast.show('Clock IN failed !!', Toast.LONG);
        this.setState({loaderVisible: false});
      });
  }
  clockOutCall() {
    this.setState({loaderVisible: true});
    let url = URL.concat('api/checker/out');
    axios
      .post(url, {
        user: this.state.userId,
      })
      .then(response => {
        this.setState({
          loaderVisible: false,
          onlineStatus: false,
        });
        Toast.show('Clock out successfull', Toast.LONG);
      })
      .catch(error => {
        Toast.show('Clock Out failed !!', Toast.LONG);
        this.setState({loaderVisible: false});
      });
  }
  async removeLoggedInCheck() {
    try {
      await AsyncStorage.removeItem('@isLoggedIn');
    } catch (e) {
      console.log('Removing logginfCheck erro : ', e);
    }
  }
  async checkCameraPermission() {
    if (Platform.OS == 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'BDG requires Camera Access',
            message: 'App needs access to take timestamp for sign in',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the camera');
          //this.props.navigation.navigate('CameraView')
        } else {
          console.log('Camera permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      //this.props.navigation.navigate('CameraView')
      console.log('You can use the camera IOS');
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
        title: 'BDG requires Location Access',
        message: 'App needs access to Location for timestamp',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the Location');
        return true;
      } else {
        console.log('Location permission denied');
        return false;
      }
    } else {
      console.log('You can use the Location IOS');
      Geolocation.requestAuthorization('always');
    }
  }
  render() {
    return (
      <View style={{height: screenHeight}}>
        <SafeAreaView>
          <LinearGradient
            style={{
              width: screenWidth,
              height: screenHeight * 1.1,
              position: 'absolute',
              zIndex: -1,
            }}
            colors={['#2c3e50', '#4ca1af']}></LinearGradient>
          <ImageBackground
            source={require('../res/img/p3.png')}
            style={{
              position: 'absolute',
              width: screenWidth,
              height: screenHeight * 1.1,
            }}
          />

          <ScrollView>
            <StatusBar
              translucent
              backgroundColor="transparent"
              barStyle="light-content"
            />
            {Platform.OS == 'android' && (
              <View style={{marginTop: screenHeight * 0.03}} />
            )}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                ellipsizeMode="tail"
                style={{
                  color: 'white',
                  fontSize: 24,
                  padding: 24,
                  marginLeft: 10,
                  fontWeight: 'bold',
                }}>
                {this.state.userName}
              </Text>
              <Text style={{color: 'white', fontSize: 24, padding: 24}}>
                {this.state.userBadge}
              </Text>
            </View>
            <Text style={{color: 'white', fontSize: 16, paddingLeft: 30}}>
              {' '}
              {this.state.userEmail}{' '}
            </Text>
            <Text
              style={{
                color: 'white',
                fontSize: 12,
                paddingLeft: 36,
                marginTop: 5,
              }}>
              {this.state.todayDate}
            </Text>

            <View style={{height: screenWidth * 0.05}} />

            {/* <View style={{height:screenWidth*0.05}} /> */}

            <View
              style={{
                flexDirection: 'row',
                padding: 12,
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({showClockMenu: !this.state.showClockMenu});
                }}
                style={{
                  width: screenWidth * 0.4,
                  height: screenWidth * 0.4,
                  borderRadius: screenWidth * 0.4,
                  backgroundColor: '#eee',
                  elevation: 5,
                  justifyContent: 'center',
                }}>
                <Image
                  source={require('../res/img/clock2.png')}
                  style={{
                    width: screenWidth * 0.25,
                    height: screenWidth * 0.25,
                    backgroundColor: 'transparent',
                    alignSelf: 'center',
                    marginTop: 0,
                    transform: [{scale: 0.9}],
                  }}
                />
                <Text style={{textAlign: 'center', paddingTop: 10}}>Clock</Text>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 20,
                    backgroundColor: this.state.onlineStatus ? '#3b7' : '#f00',
                    position: 'absolute',
                    right: 35,
                    top: 20,
                    elevation: 3,
                  }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (this.state.onlineStatus) {
                    this.props.navigation.navigate('CreateReport');
                  } else {
                    Toast.show(
                      'User must clock in to submit report!!',
                      Toast.LONG,
                    );
                  }
                }}
                style={{
                  width: screenWidth * 0.4,
                  height: screenWidth * 0.4,
                  borderRadius: screenWidth * 0.3,
                  backgroundColor: '#eee',
                  elevation: 5,
                  overflow: 'hidden',
                  justifyContent: 'center',
                }}>
                <Image
                  source={require('../res/img/business-report.png')}
                  style={{
                    width: screenWidth * 0.25,
                    height: screenWidth * 0.25,
                    alignSelf: 'center',
                    marginTop: 0,
                    transform: [{scale: 0.8}],
                  }}
                />
                <Text style={{textAlign: 'center', paddingTop: 10}}>
                  Reports
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                padding: 12,
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  //this.checkCameraPermission()
                  //this.hasLocationPermission()
                  this.props.navigation.navigate('CameraView');
                }}
                style={{
                  width: screenWidth * 0.4,
                  height: screenWidth * 0.4,
                  borderRadius: screenWidth * 0.3,
                  backgroundColor: '#eee',
                  elevation: 5,
                  overflow: 'hidden',
                  justifyContent: 'center',
                }}>
                <Image
                  source={require('../res/img/camera.png')}
                  style={{
                    width: screenWidth * 0.25,
                    height: screenWidth * 0.25,
                    alignSelf: 'center',
                    marginTop: 0,
                    transform: [{scale: 0.8}],
                  }}
                />
                <Text style={{textAlign: 'center', paddingTop: 0}}>
                  Timestamp
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('ShiftView');
                }}
                style={{
                  width: screenWidth * 0.4,
                  height: screenWidth * 0.4,
                  borderRadius: screenWidth * 0.3,
                  backgroundColor: '#eee',
                  elevation: 5,
                  justifyContent: 'center',
                }}>
                <Image
                  source={require('../res/img/shift.png')}
                  style={{
                    width: screenWidth * 0.25,
                    height: screenWidth * 0.25,
                    alignSelf: 'center',
                    marginTop: 0,
                    marginLeft: 10,
                    transform: [{scale: 0.8}],
                  }}
                />
                <Text style={{textAlign: 'center', paddingTop: 0}}>Shifts</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                padding: 12,
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('SettingsView');
                }}
                style={{
                  width: screenWidth * 0.4,
                  height: screenWidth * 0.4,
                  borderRadius: screenWidth * 0.3,
                  backgroundColor: '#eee',
                  elevation: 5,
                  justifyContent: 'center',
                }}>
                <Image
                  source={require('../res/img/profile.png')}
                  style={{
                    width: screenWidth * 0.25,
                    height: screenWidth * 0.25,
                    alignSelf: 'center',
                    marginTop: 0,
                    transform: [{scale: 0.8}],
                  }}
                />
                <Text style={{textAlign: 'center', paddingTop: 0}}>
                  Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('HelpView');
                }}
                style={{
                  width: screenWidth * 0.4,
                  height: screenWidth * 0.4,
                  borderRadius: screenWidth * 0.3,
                  backgroundColor: '#eee',
                  elevation: 5,
                  justifyContent: 'center',
                }}>
                <Image
                  resizeMode="contain"
                  source={require('../res/img/help.png')}
                  style={{
                    width: screenWidth * 0.25,
                    height: screenWidth * 0.25,
                    alignSelf: 'center',
                    marginTop: 0,
                    transform: [{scale: 0.9}],
                  }}
                />
                <Text style={{textAlign: 'center', paddingTop: 0}}>Help</Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: '#eee',
                fontSize: 14,
                alignSelf: 'center',
                marginTop: screenHeight * 0.03,
              }}>
            </Text>
            {screenHeight < 700 && <View style={{height: 50}} />}

            <Modal
              animationType="fade"
              transparent={true}
              visible={this.state.showClockMenu}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({showClockMenu: !this.state.showClockMenu});
                    }}
                    style={{
                      position: 'absolute',
                      right: 20,
                      top: 20,
                      zIndex: 5,
                    }}>
                    <Text
                      style={{
                        fontSize: 20,
                        color: '#000',
                        transform: [{scaleX: 1.3}],
                      }}>
                      X
                    </Text>
                  </TouchableOpacity>

                  <View style={{alignItems: 'center', marginTop: 50}}>
                    <TouchableOpacity
                      onPress={() => {
                        if (!this.state.onlineStatus) {
                          this.setState({
                            showClockMenu: !this.state.showClockMenu,
                          });
                          this.clockInCall();
                        }
                      }}
                      style={{
                        width: screenWidth * 0.8,
                        backgroundColor: '#eee',
                        marginVertical: 1,
                        borderBottomWidth: 1,
                        borderColor: '#ccc',
                      }}>
                      <Text
                        style={{
                          padding: 16,
                          fontSize: 16,
                          color: this.state.onlineStatus ? '#aaa' : '#000',
                        }}>
                        Clock In
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          showClockMenu: !this.state.showClockMenu,
                        });
                        this.clockOutCall();
                      }}
                      style={{
                        width: screenWidth * 0.8,
                        backgroundColor: '#eee',
                        marginVertical: 0,
                        borderBottomWidth: 1,
                        borderColor: '#ccc',
                      }}>
                      <Text style={{padding: 16, fontSize: 16}}>Clock Out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          showClockMenu: !this.state.showClockMenu,
                        });
                        this.removeLoggedInCheck();
                        Toast.show('Logout successfully', Toast.LONG);
                        this.props.navigation.replace('Authenticate');
                      }}
                      style={{
                        width: screenWidth * 0.8,
                        backgroundColor: '#f99',
                        marginVertical: 0,
                        borderBottomWidth: 1,
                        borderColor: '#ccc',
                      }}>
                      <Text style={{padding: 16, fontSize: 16, color: '#900'}}>
                        Sign out
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </ScrollView>
          {this.state.loaderVisible && (
            <View
              style={{
                width: screenWidth,
                height: screenHeight * 1.1,
                backgroundColor: '#0009',
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 6,
              }}>
              <ActivityIndicator size={42} color="#aaa"></ActivityIndicator>
            </View>
          )}
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000c',
  },
  modalView: {
    backgroundColor: '#eee',
    width: screenWidth * 0.8,
  },
});

export default Dashboard;
