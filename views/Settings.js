import React, {Component} from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StatusBar,
  Dimensions,
  ImageBackground,
  ScrollView,
  TextInput,
  Keyboard,
  TouchableOpacity,
} from 'react-native';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const axios = require('axios').default;
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import URL from '../res/data/Environment';
import IconEntypo from 'react-native-vector-icons/Entypo'

class SettingsView extends Component {
    constructor(props){
        super(props);
        this.state = {
            userName: '',
            userEmail: '',
            userId: '',
            userPhone: '',
            userAddress: '',
            userBadge: '',
            showEditScreen: false,
            editName: '',
            editBadge: '',
            editEmail: '',
            editPhone: '',
            editAddress: '',
            keyboardOpen: false,
            loaderVisible: false
        }
    }
    componentDidMount(){
        this.readSavedData()
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
    async readSavedData(){
        try {
            let id = await AsyncStorage.getItem('@userId')
            let name = await AsyncStorage.getItem('@userName')
            let email = await AsyncStorage.getItem('@userEmail')
            let phone = await AsyncStorage.getItem('@userPhone')
            let address = await AsyncStorage.getItem('@userAddress')
            let badge = await AsyncStorage.getItem('@userBadge')
            
            this.setState({
                userId: id,
                userName: name,
                userEmail: email,
                userPhone: phone,
                userAddress: address,
                userBadge: badge,
                editName: name,
                editEmail: email,
                editBadge: badge,
                editPhone: phone,
                editAddress: address
            })

        } catch(e) { console.log('Token reading error ...',e) }
    }
    saveData(name, email, phone, address){
        try{
            AsyncStorage.setItem('@userName', name)
            AsyncStorage.setItem('@userEmail', email)
            AsyncStorage.setItem('@userPhone', phone)
            AsyncStorage.setItem('@userAddress', address)
        }catch(e){console.log('Error saving data',e)}
        this.readSavedData()
    }
    async updateAccount(){
        let token = '';
        try {
            token = await AsyncStorage.getItem('@loginToken')
        } catch(e) { console.log('Token reading error ...',e) }

        this.setState({loaderVisible: true })
        let url = URL.concat('api/users/').concat(this.state.userId)
        axios.put(url,{
            name: this.state.editName,
            email: this.state.editEmail,
            phone: this.state.editPhone,
            address: this.state.editAddress
        },{
            headers: {
                'Authorization': 'Bearer '.concat(token)
            }
        })
        .then(response => {
            console.log('DEtails updated :',response.data)
            Toast.show('Details updated',Toast.LONG)
            this.saveData(this.state.editName, this.state.editEmail, this.state.editPhone, this.state.editAddress)
            this.setState({ 
                loaderVisible: false,
                showEditScreen: false
            })
        })
        .catch(error => {
            console.log('Details update error : ',error);
            this.setState({loaderVisible: false })
            Toast.show(' Updated failed !!',Toast.LONG)
        })
    }

    render(){
        return(
            <View>
                <StatusBar translucent backgroundColor="transparent" barStyle='dark-content' />
                <View style={{height:screenHeight}}>
                    {/* <LinearGradient style={{width:screenWidth, height:screenHeight*1.1, position:'absolute', zIndex:-1}} colors={['#2c3e50', '#4ca1af']}></LinearGradient> */}
                    <ImageBackground source={require('../res/img/p3.png')} style={{ position:'absolute', width:screenWidth, height:screenHeight*1.1 }}  />

                    <View style={{marginTop:screenHeight*0.05}} />
                    {
                        !this.state.showEditScreen &&
                        <View>
                            <TouchableOpacity onPress={()=>{
                                this.props.navigation.goBack()
                            }} style={{marginTop:20, marginLeft:20}}>
                                <IconEntypo name="chevron-thin-left" color="black" size={24} />
                            </TouchableOpacity>

                            <Text style={{textAlign:'center', fontSize:32}}>Profile</Text>
                            <View style={{flexDirection:'row', alignItems:'center', padding:20, marginTop:50, marginLeft:15}}>
                                <Text style={{width:screenWidth*0.2, fontSize:16}}>Name: </Text>
                                <Text style={{fontSize:16}}>{this.state.userName}</Text>
                            </View>
                            <View style={{flexDirection:'row', alignItems:'center', padding:24, marginLeft:15}}>
                                <Text style={{width:screenWidth*0.2, fontSize:16}}>Badge: </Text>
                                <Text style={{fontSize:16}}>{this.state.userBadge}</Text>
                            </View>
                            <View style={{flexDirection:'row', alignItems:'center', padding:20, marginLeft:15}}>
                                <Text style={{width:screenWidth*0.2, fontSize:16}}>Email: </Text>
                                <Text style={{fontSize:16}}>{this.state.userEmail}</Text>
                            </View>
                            <View style={{flexDirection:'row', alignItems:'center', padding:20, marginLeft:15}}>
                                <Text style={{width:screenWidth*0.2, fontSize:16}}>Phone: </Text>
                                <Text style={{fontSize:16}}>{this.state.userPhone}</Text>
                            </View>
                            <View style={{flexDirection:'row', alignItems:'center', padding:24, marginLeft:15}}>
                                <Text style={{width:screenWidth*0.2, fontSize:16}}>Address: </Text>
                                <Text style={{fontSize:16, width:screenWidth*0.75}}>{this.state.userAddress}</Text>
                            </View>

                            <View style={{height:screenHeight*0.1}} />
                            <TouchableOpacity onPress={()=>{
                                this.setState({
                                    showEditScreen: !this.state.showEditScreen
                                })
                            }} style={{backgroundColor:'black', width:screenWidth*0.85, 
                                alignSelf:'center', padding:18, borderRadius:12
                            }}>
                                <Text style={{color:'white', fontSize:18, textAlign:'center',}}>Edit Profile</Text>
                            </TouchableOpacity>
                            {/* <Text style={{fontSize:18, textAlign:'justify', padding:20, marginTop:30, fontWeight:'bold'}}>
                                Update profile COMING SOON
                            </Text> */}
                        </View>
                    }
                    {
                        this.state.showEditScreen &&
                        <View style={{width:screenWidth, height:screenHeight, position:'absolute'}}>
                            <View style={{height:screenHeight*0.05}} />
                            <TouchableOpacity onPress={()=>{
                                this.props.navigation.goBack()
                            }} style={{marginTop:20, marginLeft:20}}>
                                <IconEntypo name="chevron-thin-left" color="black" size={24} />
                            </TouchableOpacity>
                            <Text style={{fontSize:24, textAlign:'center'}}>Edit Profile</Text>
                            <ScrollView>
                                <View style={{paddingHorizontal:12, paddingVertical:8}}>
                                    <Text style={{paddingVertical:12, marginLeft:24}}>Name</Text>
                                    <TextInput
                                    value={this.state.editName}
                                    placeholder="Name"
                                    placeholderTextColor="#aaa"
                                    autoFocus={false}
                                    onChangeText={val=>{ this.setState({editName: val}) }} 
                                    style={{color:'#555', borderColor:'#bbb', borderWidth:1, borderRadius:10, width:screenWidth*0.85, 
                                        padding:12, alignSelf:'center'
                                    }} />
                                </View>
                                <View style={{ paddingHorizontal:12}}>
                                    <Text style={{paddingVertical:12, marginLeft:24}}>Email</Text>
                                    <TextInput
                                    value={this.state.editEmail}
                                    placeholder="Name"
                                    placeholderTextColor="#aaa"
                                    autoFocus={false}
                                    editable={false}
                                    onChangeText={val=>{ this.setState({editEmail: val}) }} 
                                    style={{color:'#aaa', borderColor:'#ddd', borderWidth:0, borderRadius:10, width:screenWidth*0.85, 
                                        padding:12, alignSelf:'center'
                                    }} />
                                </View>
                                <View style={{paddingHorizontal:12}}>
                                    <Text style={{paddingVertical:12, marginLeft:24}}>Badge</Text>
                                    <TextInput
                                    value={this.state.editBadge}
                                    placeholder="Name"
                                    placeholderTextColor="#aaa"
                                    autoFocus={false}
                                    editable={false}
                                    onChangeText={val=>{ this.setState({editBadge: val}) }} 
                                    style={{color:'#aaa', borderColor:'#ddd', borderWidth:0, borderRadius:10, width:screenWidth*0.85, 
                                        padding:12, alignSelf:'center'
                                    }} />
                                </View>
                                <View style={{paddingHorizontal:12, paddingVertical:8}}>
                                    <Text style={{paddingVertical:12, marginLeft:24}}>Phone</Text>
                                    <TextInput
                                    value={this.state.editPhone}
                                    placeholder="Name"
                                    placeholderTextColor="#aaa"
                                    autoFocus={false}
                                    onChangeText={val=>{ this.setState({editPhone: val}) }} 
                                    style={{color:'#555', borderColor:'#bbb', borderWidth:1, borderRadius:10, width:screenWidth*0.85, 
                                        padding:12, alignSelf:'center'
                                    }} />
                                </View>
                                <View style={{paddingHorizontal:12, paddingVertical:8}}>
                                    <Text style={{paddingVertical:12, marginLeft:24}}>Address</Text>
                                    <TextInput
                                    value={this.state.editAddress}
                                    placeholder="Name"
                                    placeholderTextColor="#aaa"
                                    autoFocus={false}
                                    onChangeText={val=>{ this.setState({editAddress: val}) }} 
                                    style={{color:'#555', borderColor:'#bbb', borderWidth:1, borderRadius:10, width:screenWidth*0.85, 
                                        padding:12, alignSelf:'center'
                                    }} />
                                </View>
                                <TouchableOpacity onPress={()=>{
                                    this.updateAccount()
                                }} style={{backgroundColor:'black', width:screenWidth*0.85, alignSelf:'center', padding:18, borderRadius:12, marginTop:20}}>
                                    <Text style={{textAlign:'center', color:'white', fontSize:16}}>Update</Text>
                                </TouchableOpacity>

                                {
                                    this.state.keyboardOpen &&
                                    <View style={{height:screenHeight*0.4}} />
                                }
                            </ScrollView>

                        </View>
                    }
                </View>
                {
                    this.state.loaderVisible &&
                    <View style={{width:screenWidth, height:screenHeight*1.1, backgroundColor:'#0009', position:'absolute', justifyContent:'center', alignItems:'center'}}>
                        <ActivityIndicator size={42} color="#aaa">
                        </ActivityIndicator>
                    </View>
                }
            </View>
        );
    }
}

export default SettingsView;