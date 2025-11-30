import React, {Component} from 'react';
import {
  ScrollView,
  ActivityIndicator,
  Keyboard,
  View,
  Text,
  Image,
  StatusBar,
  Platform,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from 'react-native';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const axios = require('axios').default;
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import URL from '../res/data/Environment';
import Snackbar from 'react-native-snackbar';

class Authenticate extends Component {
    constructor(props){
        super(props);
        this.state = {
            loaderVisible: false,
            email: '',
            password: '',
            remember: false,
            isScreenLoading: true,
            createAccountVisible: false,
            signName: '',
            signEmail: '',
            signPassword: '',
            signConfirmPassword: '',
            signPhone: '',
            signAddress: '',
            keyboardOpen: false
        }
    }
    componentDidMount(){
        this.getData();
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', ()=>{
            this.setState({
                keyboardOpen: true
            })
        });
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', ()=>{
            this.setState({
                keyboardOpen: false
            })
        });
    }
    componentWillUnmount(){
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    getData = async() => {
        let isLoggedIn = '', readEmail = '';
        try {
            isLoggedIn = await AsyncStorage.getItem('@isLoggedIn')
            readEmail = await AsyncStorage.getItem('@userEmail')

            if(isLoggedIn === null) {
                if(readEmail !== null){
                    this.setState({
                        email: readEmail
                    })
                }else{

                }
            } else {
                this.props.navigation.replace('Dashboard')
            }
            this.setState({
                isScreenLoading : false
            })
        } catch(e) { console.log('checkingLogin Error ...',e) }
    }

    storeData = async (token, id, name, email, phone, address, badge) => {
        try {
          await AsyncStorage.setItem('@loginToken', token)
          await AsyncStorage.setItem('@userId', id)
          await AsyncStorage.setItem('@userName', name)
          await AsyncStorage.setItem('@userEmail', email)
          await AsyncStorage.setItem('@userPass', this.state.password)
          await AsyncStorage.setItem('@userPhone', phone)
          await AsyncStorage.setItem('@userAddress', address)
          await AsyncStorage.setItem('@userBadge', ''.concat(badge))
          await AsyncStorage.setItem('@isLoggedIn', 'true')
          this.props.navigation.replace('Dashboard')
        } catch (e) { console.log('Login token save error : ',e) }
    }

    loginCall(){
        this.setState({loaderVisible: true })
        let url = URL.concat('api/login')
        axios.post(url,{
            email: this.state.email.toLowerCase().trim(),
            password: this.state.password
        }) 
        .then(response => {
            //console.log('Login disabled is',response.data.data?.doc?.disabled)
            let token = response.data.data?.doc?.token
            let id = response.data.data?.doc?._id
            let name = response.data.data?.doc?.name
            let email = response.data.data?.doc?.email
            let phone = response.data.data?.doc?.phone
            let address = response.data.data?.doc?.address
            let badge = response.data.data?.doc?.badge
            if(!response.data.data?.doc?.disabled){
                this.storeData(token, id, name, email, phone, address, badge);  
            }else{
                Toast.show('Access Restricted', Toast.LONG);
                Snackbar.show({
                    text: 'Access Restricted',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'Dismiss',
                      textColor: 'red',
                      onPress: () => { Snackbar.dismiss() },
                    },
                });
            }
            //this.storeData(token, id, name, email, phone, address, badge);
            this.setState({ loaderVisible: false })
        })
        .catch(error => {
            console.log('Login Error : ',error?.response?.data?.message,' : ',error?.response?.data?.error);
            
            if(!error?.response){
                Snackbar.show({
                    text: 'Network Failure',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'Dismiss',
                      textColor: 'orange',
                      onPress: () => { Snackbar.dismiss() },
                    },
                });
            }
            else{
                let message = error?.response?.data?.message;
                message = message? message:'Login Failed'
                Snackbar.show({
                    text: message,
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'Dismiss',
                      textColor: 'red',
                      onPress: () => { Snackbar.dismiss() },
                    },
                });
            }
            this.setState({loaderVisible: false })
        })
    }
    async signupCall(){
        this.setState({loaderVisible: true })
        let url = URL.concat('api/users')
        axios.post(url,{
            name: this.state.signName,
            email: this.state.signEmail,
            password: this.state.signPassword,
            phone: this.state.signPhone,
            address: this.state.signAddress
        }) 
        .then(response => {
            console.log('Signup created :',response.data)
            Snackbar.show({
                text: 'Account Created',
                duration: Snackbar.LENGTH_LONG,
                action: {
                  text: 'Dismiss',
                  textColor: 'green',
                  onPress: () => { Snackbar.dismiss() },
                },
            });
            this.setState({ 
                loaderVisible: false,
                createAccountVisible: false
            })
        })
        .catch(error => {
            console.log('Signup error : ',error);
            this.setState({loaderVisible: false })
            if(!error?.response){
                Snackbar.show({
                    text: 'Network Failure',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'Dismiss',
                      textColor: 'orange',
                      onPress: () => { Snackbar.dismiss() },
                    },
                });
            }
            else{
                let message = error?.response?.data?.message;
                message = message? message:'Signup Failed'
                Snackbar.show({
                    text: message,
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'Dismiss',
                      textColor: 'red',
                      onPress: () => { Snackbar.dismiss() },
                    },
                });
            }
        })
    }
    render(){
        return(
            <View>
                <StatusBar backgroundColor="#eee" barStyle='dark-content' />
                
                <ScrollView style={{width:screenWidth}}>
                    {
                        Platform.OS === 'ios' &&
                        <View style={{height:screenHeight*0.03}} />
                        // :
                        // <View style={{height:screenHeight*0.08}} />
                    }
                    <View style={{height:screenHeight*0.05}} />    
                    <Image source={require('../res/img/logo.png')} style={{width:screenWidth, height:250, 
                        transform:[{scaleX:1.1}]
                    }} resizeMode="contain" />

                    <TextInput
                    value={this.state.email}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    keyboardType='email-address'
                    autoCapitalize="none"
                    autoFocus={false}
                    onChangeText={val=>{
                        let fixVal = '';
                        fixVal = val.toLowerCase()
                        this.setState({email: val})
                    }}
                    style={{color:'#555', borderColor:'#ccc', borderWidth:1, borderRadius:4, width:screenWidth*0.85, paddingLeft:12, 
                        marginLeft:0, alignSelf:'center', marginTop:30, paddingVertical: Platform.OS === 'ios'?15:10
                    }} />

                    <TextInput
                    value={this.state.password}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    autoCapitalize="none"
                    secureTextEntry={true}
                    onChangeText={val=>{this.setState({password: val})}}
                    style={{color:'#555', borderColor:'#ccc', borderWidth:1, borderRadius:4, width:screenWidth*0.85, paddingLeft:12, 
                        marginLeft:0, alignSelf:'center',  marginTop:20, paddingVertical: Platform.OS === 'ios'?15:10
                    }} />
                    <View style={{alignSelf:'center', alignItems:'flex-end', width:screenWidth*0.85, paddingVertical:8}}>
                        <TouchableOpacity onPress={()=>{
                            this.props.navigation.navigate('ForgotPassword')
                        }}>
                            <Text style={{fontSize:12, marginLeft:10}}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={()=>{
                        if(this.state.email.length > 0 && this.state.password.length > 0){
                            this.loginCall()
                        } else {
                            Toast.show('Empty Form',Toast.LONG)
                        }
                    }} style={{backgroundColor:'black', width:screenWidth*0.85, alignSelf:'center', padding:18, borderRadius:4, marginTop:20}}>
                        <Text style={{textAlign:'center', color:'white', }}>Sign in</Text>
                    </TouchableOpacity>

                    {/* <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', padding:20}}>
                        <Text style={{fontSize:12}}>Need an account ?</Text>
                        <TouchableOpacity onPress={()=>{
                            this.setState({
                                createAccountVisible: true
                            })
                        }}>
                            <Text style={{fontWeight:'bold', fontSize:14, marginLeft:10}}>Create Account</Text>
                        </TouchableOpacity>
                    </View> */}

                    {/* <TouchableOpacity onPress={()=>{
                        this.props.navigation.navigate('HomePage')
                    }} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', 
                        marginTop:screenHeight*0.06, borderRadius:screenWidth*0.5, borderWidth:1, width:screenWidth*0.5,
                        alignSelf:'center', padding:12, borderColor:'transparent'
                    }}>
                        <Text style={{fontSize:16, color:'#000'}}>HomePage</Text>
                        <EntypoIcon name='arrow-with-circle-right' size={26} color='black' style={{marginLeft:10}} />
                    </TouchableOpacity> */}
                    <View style={{height:screenHeight*0.1}} />
                </ScrollView>
                {
                    this.state.createAccountVisible &&
                    <View style={{width:screenWidth, height:screenHeight, position:'absolute', backgroundColor:'#eee'}}>
                        <View style={{height:screenHeight*0.05}} />
                        <Text style={{fontSize:28, textAlign:'center', paddingVertical:14}}>Create Account</Text>
                        <ScrollView>
                            <TextInput
                            value={this.state.signName}
                            placeholder="Name"
                            placeholderTextColor="#aaa"
                            autoFocus={false}
                            onChangeText={val=>{ this.setState({signName: val}) }} 
                            style={{color:'#555', borderColor:'#ccc', borderWidth:1, borderRadius:4, width:screenWidth*0.85, paddingLeft:12, 
                                marginLeft:0, alignSelf:'center', marginTop:30, paddingVertical: Platform.OS === 'ios'?15:10
                            }} />
                            <TextInput
                            value={this.state.signEmail}
                            placeholder="Email"
                            placeholderTextColor="#aaa"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoFocus={false}
                            onChangeText={val=>{ this.setState({signEmail: val}) }}
                            style={{color:'#555', borderColor:'#ccc', borderWidth:1, borderRadius:4, width:screenWidth*0.85, paddingLeft:12, 
                                marginLeft:0, alignSelf:'center', marginTop:30, paddingVertical: Platform.OS === 'ios'?15:10
                            }} />
                            <TextInput
                            value={this.state.signPhone}
                            placeholder="Phone"
                            placeholderTextColor="#aaa"
                            keyboardType="number-pad"
                            autoFocus={false}
                            onChangeText={val=>{ this.setState({signPhone: val}) }} 
                            style={{color:'#555', borderColor:'#ccc', borderWidth:1, borderRadius:4, width:screenWidth*0.85, paddingLeft:12, 
                                marginLeft:0, alignSelf:'center', marginTop:30, paddingVertical: Platform.OS === 'ios'?15:10
                            }} />
                            <TextInput
                            value={this.state.signAddress}
                            placeholder="Address"
                            placeholderTextColor="#aaa"
                            autoFocus={false}
                            onChangeText={val=>{ this.setState({signAddress: val}) }} 
                            style={{color:'#555', borderColor:'#ccc', borderWidth:1, borderRadius:4, width:screenWidth*0.85, paddingLeft:12, 
                                marginLeft:0, alignSelf:'center', marginTop:30, paddingVertical: Platform.OS === 'ios'?15:10
                            }} />
                            <TextInput
                            value={this.state.signPassword}
                            placeholder="Password"
                            placeholderTextColor="#aaa"
                            keyboardType='web-search'
                            autoCapitalize="none"
                            secureTextEntry={true}
                            onChangeText={val=>{this.setState({signPassword: val})}}
                            style={{color:'#555', borderColor:'#ccc', borderWidth:1, borderRadius:4, width:screenWidth*0.85, paddingLeft:12, 
                                marginLeft:0, alignSelf:'center',  marginTop:20, paddingVertical: Platform.OS === 'ios'?15:10
                            }} />
                            <TextInput
                            value={this.state.signConfirmPassword}
                            placeholder="Confirm Password"
                            placeholderTextColor="#aaa"
                            keyboardType='web-search'
                            autoCapitalize="none"
                            secureTextEntry={true}
                            onChangeText={val=>{this.setState({signConfirmPassword: val})}}
                            style={{color:'#555', borderColor:'#ccc', borderWidth:1, borderRadius:4, width:screenWidth*0.85, paddingLeft:12, 
                                marginLeft:0, alignSelf:'center',  marginTop:20, paddingVertical: Platform.OS === 'ios'?15:10
                            }} />
                            <TouchableOpacity onPress={()=>{
                                // this.signupCall()
                                if(this.state.signName.length > 0 && this.state.signEmail.length > 0 && this.state.signPhone.length > 0 
                                    && this.state.signAddress.length > 0 && this.state.signPassword.length > 0
                                ){
                                    
                                    if(this.state.signPassword === (this.state.signConfirmPassword) ){
                                        console.log("Password match")
                                        this.signupCall()
                                    }else{
                                        console.log("Password doesn't match")
                                        Toast.show('Password does not match',Toast.LONG)
                                    }

                                } else {
                                    Toast.show('Empty Form',Toast.LONG)
                                }

                            }} style={{backgroundColor:'black', width:screenWidth*0.85, alignSelf:'center', padding:18, borderRadius:4, marginTop:20}}>
                                <Text style={{textAlign:'center', color:'white', }}>Create</Text>
                            </TouchableOpacity>
                            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', padding:20}}>
                                <Text style={{fontSize:12}}>Already have an account ?</Text>
                                <TouchableOpacity onPress={()=>{
                                    this.setState({
                                        createAccountVisible: false
                                    })
                                }}>
                                    <Text style={{fontWeight:'bold', fontSize:14, marginLeft:10}}>Login</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{height:screenHeight*0.05}} />
                            {
                                this.state.keyboardOpen &&
                                <View style={{height:screenHeight*0.3}} />
                            }

                        </ScrollView>
                    </View>
                }
                
                {
                    this.state.loaderVisible &&
                    <View style={{width:screenWidth, height:screenHeight*1.1, backgroundColor:'#0009', position:'absolute', justifyContent:'center', alignItems:'center'}}>
                        <ActivityIndicator size={42} color="#aaa">
                        </ActivityIndicator>
                    </View>
                }
                {
                    this.state.isScreenLoading &&
                    <View style={{width:screenWidth, height:screenHeight*1.1, backgroundColor:'#eee', position:'absolute', justifyContent:'center', alignItems:'center'}}>
                        <ActivityIndicator size={42} color="#aaa">
                        </ActivityIndicator>
                    </View>
                }
            </View>
        );
    }
}

export default Authenticate;