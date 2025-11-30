import React, {Component} from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StatusBar,
  Platform,
  Dimensions,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const axios = require('axios').default;
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import URL from '../res/data/Environment';
var moment = require('moment');
import Ripple from 'react-native-material-ripple';
import IconEntypo from 'react-native-vector-icons/Entypo';

class ShiftView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaderVisible: false,
      shiftArray: [],
      shiftArrrayCompleted: [],
      tab1Select: true,
      curDate: new Date(),
    };
  }
  componentDidMount() {
    console.log('URL is : ', URL);
    this.getData();
  }
  getData = async () => {
    let userId = '',
      token = '';
    try {
      userId = await AsyncStorage.getItem('@userId');
      token = await AsyncStorage.getItem('@loginToken');
      console.log('UserId read is : ', userId);
      this.getUserShifts(userId, token);
      //this.getUserShiftsCompleted(userId,token)
      //this.getUserShiftById(token)
    } catch (e) {
      console.log('reading Error ...', e);
    }
  };
  getUserShifts(id, token) {
    //let ds1 = moment().format('YYYY-MM-DD')
    let ds1 = moment().subtract(6, 'M').format('YYYY-MM-DD');
    // console.log('Date from date is : ',ds1,' : ',moment())
    let ds2 = moment().add(1, 'y').format('YYYY-12-31');
    // console.log('Date to date is : ',ds2,' : ',moment().add(1, 'y'))

    this.setState({loaderVisible: true});
    let url = URL.concat('api/user-shifts/').concat(id);
    axios
      .post(
        url,
        {
          status: 1,
          from: ds1,
          to: ds2,
        },
        {
          headers: {
            Authorization: 'Bearer '.concat(token),
          },
        },
      )
      .then(response => {
        let arrDump = response.data?.data?.doc;
        arrDump.sort((s1, s2) => {
          return new Date(s1.from) - new Date(s2.from);
        });
        this.setState({
          loaderVisible: false,
          shiftArray: arrDump,
        });
        this.getUserShiftsCompleted(arrDump);
      })
      .catch(error => {
        console.log('Get user shits error : ', error);
        this.setState({loaderVisible: false});
      });
  }
  getUserShiftsCompleted(shiftsArray) {
    let completedArray = [];
    let upcomingArray = [];
    shiftsArray.map(shift => {
      if (this.state.curDate > new Date(shift.to)) {
        completedArray.push(shift);
      } else {
        upcomingArray.push(shift);
      }
    });
    this.setState({
      loaderVisible: false,
      shiftArray: upcomingArray,
      shiftArrrayCompleted: completedArray,
    });

    // let ds1 = moment().format('YYYY-01-01')
    // console.log('CompletedDate from date is : ',ds1)
    // let ds2 = moment().add(1,'days').format('YYYY-MM-DD')
    // console.log('CompletedDate from date is : ',ds2)

    // this.setState({loaderVisible: true })
    // let url = URL.concat('api/user-shifts/').concat(id)
    // axios.post(url,{
    //     status: 1,
    //     from: ds1,
    //     to: ds2
    // }, {
    //     headers: {
    //         'Authorization': 'Bearer '.concat(token)
    //     }
    // })
    // .then(response => {
    //     console.log('Get user shits completed are : ',response.data)
    //     this.setState({
    //         loaderVisible: false,
    //         shiftArrrayCompleted: response.data?.data?.doc
    //     })
    // })
    // .catch(error => {
    //     console.log('Get user shits error : ',error);
    //     this.setState({loaderVisible: false })
    // })
  }

  render() {
    return (
      <View>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        {/* <SafeAreaView> */}

        <ImageBackground
          source={require('../res/img/p3.png')}
          style={{
            position: 'absolute',
            width: screenWidth,
            height: screenHeight * 1.1,
          }}
        />
        <LinearGradient
          style={{
            width: screenWidth,
            height: screenHeight,
            position: 'absolute',
            zIndex: -1,
          }}
          colors={['#2c3e50', '#4ca1af']}></LinearGradient>
        {Platform.OS == 'ios' && (
          <View style={{marginTop: screenHeight * 0.05}} />
        )}
        {Platform.OS === 'android' && (
          <View style={{height: screenHeight * 0.03}} />
        )}
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.goBack();
          }}
          style={{marginTop: 20, marginLeft: 25, zIndex: 5}}>
          <IconEntypo name="chevron-thin-left" color="white" size={24} />
        </TouchableOpacity>

        <View
          style={{
            height: screenHeight * 0.12,
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: 24,
              textAlign: 'center',
              padding: 20,
            }}>
            My Shifts
          </Text>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Ripple
              rippleColor="#ddd"
              onPress={() => {
                this.setState({
                  tab1Select: true,
                });
              }}
              style={{
                width: screenWidth * 0.5,
                padding: 16,
                borderBottomWidth: 5,
                borderBottomColor: this.state.tab1Select
                  ? '#4ca1af'
                  : 'transparent',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: this.state.tab1Select ? 16 : 14,
                }}>
                Upcoming
              </Text>
            </Ripple>
            <Ripple
              rippleColor="#ddd"
              onPress={() => {
                this.setState({
                  tab1Select: false,
                });
              }}
              style={{
                width: screenWidth * 0.5,
                padding: 16,
                borderBottomWidth: 5,
                borderBottomColor: !this.state.tab1Select
                  ? '#4ca1af'
                  : 'transparent',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: !this.state.tab1Select ? 16 : 14,
                }}>
                Completed
              </Text>
            </Ripple>
          </View>
        </View>
        <ScrollView
          style={{backgroundColor: 'white', height: screenHeight * 0.82}}>
          {this.state.tab1Select && (
            <View style={{padding: 24}}>
              {this.state.shiftArray.length > 0 ? (
                this.state.shiftArray.map((shift, index) => {
                  if (this.state.curDate < new Date(shift.to)) {
                    return (
                      <View
                        key={Math.random()}
                        style={{
                          padding: 24,
                          width: screenWidth * 0.9,
                          backgroundColor: '#ddd',
                          alignSelf: 'center',
                          borderRadius: 8,
                          marginBottom: 12,
                        }}>
                        <Text style={{color: 'black', fontSize: 18}}>
                          {shift.name}
                        </Text>
                        <Text style={{color: 'black', marginTop: 8}}>
                          {shift?.site?.location}
                        </Text>
                        <View
                          style={{
                            marginTop: 15,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text style={{width: 60}}>From</Text>
                          <Text style={{color: 'black'}}>
                            {moment(shift.from).format('LL - LT')}
                          </Text>
                        </View>
                        <View
                          style={{
                            marginTop: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text style={{width: 60}}>To</Text>
                          <Text style={{color: 'black'}}>
                            {moment(shift.to).format('LL - LT')}
                          </Text>
                        </View>
                        {this.state.curDate > new Date(shift.from) &&
                          this.state.curDate < new Date(shift.to) && (
                            <Text
                              style={{
                                color: 'green',
                                marginTop: 10,
                                fontWeight: 'bold',
                              }}>
                              Ongoing
                            </Text>
                          )}
                        {this.state.curDate < new Date(shift.from) &&
                          this.state.curDate < new Date(shift.to) && (
                            <Text
                              style={{
                                color: '#EC9706',
                                marginTop: 10,
                                fontWeight: 'bold',
                              }}>
                              Upcoming
                            </Text>
                          )}
                        {this.state.curDate > new Date(shift.to) && (
                          <Text
                            style={{
                              color: 'red',
                              marginTop: 10,
                              fontWeight: 'bold',
                            }}>
                            Completed
                          </Text>
                        )}

                        {shift.totalMinutes && (
                          <Text
                            style={{
                              color: 'white',
                              marginTop: 10,
                              position: 'absolute',
                              top: 20,
                              right: 15,
                              backgroundColor: '#2c3e50',
                              paddingHorizontal: 12,
                              paddingVertical: 3,
                              borderRadius: 5,
                            }}>
                            {Number(parseInt(shift.totalMinutes))} min
                          </Text>
                        )}
                      </View>
                    );
                  }
                })
              ) : (
                <View
                  style={{
                    height: screenHeight * 0.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{fontSize: 24, color: 'grey', textAlign: 'center'}}>
                    No records
                  </Text>
                </View>
              )}
            </View>
          )}
          {!this.state.tab1Select && (
            <View style={{padding: 24}}>
              {this.state.shiftArrrayCompleted.length > 0 ? (
                this.state.shiftArrrayCompleted.map((shift, index) => {
                  return (
                    <View
                      key={Math.random()}
                      style={{
                        padding: 24,
                        width: screenWidth * 0.9,
                        backgroundColor: '#ddd',
                        alignSelf: 'center',
                        borderRadius: 8,
                        marginBottom: 12,
                        elevation: 5,
                      }}>
                      <Text style={{color: 'black', fontSize: 18}}>
                        {shift.name}
                      </Text>
                      <Text style={{color: 'black', marginTop: 8}}>
                        {shift?.site?.location}
                      </Text>

                      <View
                        style={{
                          marginTop: 15,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text style={{width: 60}}>From</Text>
                        <Text style={{color: 'black'}}>
                          {moment(shift.from).format('LL - LT')}
                        </Text>
                      </View>
                      <View
                        style={{
                          marginTop: 3,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text style={{width: 60}}>To</Text>
                        <Text style={{color: 'black'}}>
                          {moment(shift.to).format('LL - LT')}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: '#900',
                          marginTop: 10,
                          fontWeight: 'bold',
                        }}>
                        Completed
                      </Text>

                      {shift.totalMinutes && (
                        <Text
                          style={{
                            color: 'white',
                            marginTop: 10,
                            position: 'absolute',
                            top: 20,
                            right: 15,
                            backgroundColor: '#2c3e50',
                            paddingHorizontal: 12,
                            paddingVertical: 3,
                            borderRadius: 5,
                          }}>
                          {Number(parseInt(shift.totalMinutes))} min
                        </Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <View
                  style={{
                    height: screenHeight * 0.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{fontSize: 24, color: 'grey', textAlign: 'center'}}>
                    No records
                  </Text>
                </View>
              )}
            </View>
          )}
          <View style={{height: screenHeight * 0.1}}></View>
        </ScrollView>

        {/* </SafeAreaView> */}

        {this.state.loaderVisible && (
          <View
            style={{
              width: screenWidth,
              height: screenHeight * 1.1,
              backgroundColor: '#0009',
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator size={42} color="#aaa"></ActivityIndicator>
          </View>
        )}
      </View>
    );
  }
}

export default ShiftView;
