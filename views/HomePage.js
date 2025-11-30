import React, {Component} from 'react';
import {
  ScrollView,
  ActivityIndicator,
  View,
  Text,
  Image,
  StatusBar,
  ImageBackground,
  Platform,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const axios = require('axios').default;
import EntypoIcon from 'react-native-vector-icons/Entypo';
import LinearGradient from 'react-native-linear-gradient';

class HomePage extends Component {
    constructor(props){
        super(props);
        this.state = {
            loaderVisible: false,
        }
    }
    componentDidMount(){}

    render(){
        return(
            <View style={{backgroundColor:'#eee'}}>
                <StatusBar translucent backgroundColor="transparent" barStyle='light-content' />
                <ImageBackground source={require('../res/img/p3.png')} style={{ position:'absolute', width:screenWidth, height:screenHeight*1.1 }} />

                {/* <SafeAreaView> */}
                    <ScrollView style={{width:screenWidth, height:screenHeight*1.1 }}>
                        <View>
                            <View style={{height:screenHeight*0.0}} />
                            <View style={{width:screenWidth, height:screenHeight*0.6, position:'relative'}}>
                                <Image source={require('../res/img/banner3.jpg')} style={{width:screenWidth, height:screenHeight*0.6}} resizeMode='cover' />
                                <View style={{width:screenWidth, height:screenHeight*0.6, backgroundColor:'#0007', position:'absolute'}} />
                                <View style={{padding:20, position:'absolute', width:screenWidth, height:screenHeight*0.6, justifyContent:'center', alignItems:'center'}}>
                                    
                                    <Image source={require('../res/img/logo.png')} style={{width:screenWidth, height:screenHeight*0.25}} resizeMode='contain' />
                                    <View style={{height:screenHeight*0.05}} />
                                    <Text style={{color:'white', fontSize:22, fontWeight:'bold', textAlign:'center'}}>
                                        BDG Protection Services
                                    </Text>
                                    <Text style={{color:'white', fontSize:12, textAlign:'center', marginTop:18}}>
                                        We provide the best security services in various generes of surviellance.
                                    </Text>

                                </View>
                                <TouchableOpacity onPress={()=>{
                                    this.props.navigation.goBack()
                                }} style={{zIndex:5, position:'absolute', top:screenHeight*0.08, left:15}}>
                                    <EntypoIcon name="chevron-thin-left" color="white" size={28} />
                                </TouchableOpacity>
                            </View>

                            {/* Services Section  */}
                            <View style={{width:screenWidth, height:screenHeight*0.2, justifyContent:'center', alignItems:'center'}}>
                                <Text style={{color:'#777', textAlign:'center'}}>What we are best at</Text>
                                <Text style={{fontSize:30, textAlign:'center', marginTop:screenHeight*0.02, letterSpacing:2}}>Our Services</Text>
                            </View>
                            {/* Service Cards */}
                            <View style={{width:screenWidth, height:screenWidth, justifyContent:'center', alignItems:'center'}}>
                                <Image source={require('../res/img/event2.png')} style={{width:screenWidth*0.7, height:screenWidth*0.7, borderRadius:screenWidth*0.7}} resizeMode='cover' />
                                <Text style={{fontSize:20, textAlign:'center', marginTop:40, letterSpacing:1}}>Event Security</Text>
                                <Text style={{fontSize:16, textAlign:'center', marginTop:10, paddingHorizontal:12}}>
                                    We provide a range of event security coverages with fully professional guards and security professionals.
                                </Text>
                            </View>
                            <View style={{width:screenWidth, height:screenWidth, justifyContent:'center', alignItems:'center', marginTop:50}}>
                                <Image source={require('../res/img/commercial.png')} style={{width:screenWidth*0.7, height:screenWidth*0.7, borderRadius:screenWidth*0.7}} resizeMode='cover' />
                                <Text style={{fontSize:20, textAlign:'center', marginTop:40, letterSpacing:1}}>Condomenium Security</Text>
                                <Text style={{fontSize:16, textAlign:'center', marginTop:10, paddingHorizontal:12}}>
                                    BDG has variety of condomenium professionals who can manage the entire system.
                                </Text>
                            </View>
                            <View style={{width:screenWidth, height:screenWidth, justifyContent:'center', alignItems:'center', marginTop:50}}>
                                <Image source={require('../res/img/securityBackground.jpg')} style={{width:screenWidth*0.7, height:screenWidth*0.7, borderRadius:screenWidth*0.7}} resizeMode='cover' />
                                <Text style={{fontSize:20, textAlign:'center', marginTop:40, letterSpacing:1}}>Commercial Security</Text>
                                <Text style={{fontSize:16, textAlign:'center', marginTop:10, paddingHorizontal:12}}>
                                    We provide a range of commercial security services as per client's requirments.
                                </Text>
                            </View>
                            <View style={{width:screenWidth, height:screenWidth, justifyContent:'center', alignItems:'center', marginTop:50}}>
                                <Image source={require('../res/img/construction2.png')} style={{width:screenWidth*0.7, height:screenWidth*0.7, borderRadius:screenWidth*0.7}} resizeMode='cover' />
                                <Text style={{fontSize:20, textAlign:'center', marginTop:40, letterSpacing:1}}>Construction Coverage</Text>
                                <Text style={{fontSize:16, textAlign:'center', marginTop:10, paddingHorizontal:12}}>
                                    Fully trained construction site guards can secure the property and its equipments securely.
                                </Text>
                            </View>
                            
                            <View style={{width:screenWidth, height:screenWidth, marginTop:80, backgroundColor:'black', 
                                justifyContent:'center', alignItems:'center'
                            }}>
                                <Text style={{color:'white', fontSize:28, letterSpacing:1, textAlign:'center'}}>
                                    Join our Team
                                </Text>
                                <Text style={{color:'white', fontSize:12, letterSpacing:1, paddingHorizontal:12, textAlign:'center', marginTop:20}}>
                                    Think you have what it takes? Build your career with the fastest growing security company 
                                    in Canada.
                                </Text>
                                <View style={{height:screenHeight*0.05}} />
                                <Text style={{color:'white'}}>For career oppotunities</Text>
                                <TouchableOpacity onPress={()=>{
                                    Linking.openURL('http://www.bdgprotection.com')
                                }} style={{width:screenWidth*0.6, height:60, borderRadius:12, backgroundColor:'#333',
                                    justifyContent:'center', alignItems:'center', marginTop:20
                                }}>
                                    <Text style={{textAlign:'center', color:'white'}}>Go to website</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{width:screenWidth, height:screenWidth, marginTop:100}}>
                                <LinearGradient style={{width:screenWidth, height: screenWidth,}} colors={['transparent', '#ccc']}>
                                    <Text style={{textAlign:'center', fontSize:28, letterSpacing:1}}>Contact Us</Text>

                                    <View style={{height:screenHeight*0.04}} />
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', padding:12}}>
                                        <EntypoIcon name='location-pin' size={24} color='black' />
                                        <View style={{marginLeft:screenWidth*0.05, width:screenWidth*0.5}}>
                                            <Text>15 Allstate Pkwy, Markham, </Text>
                                            <Text>ON, L3R 5B4</Text>
                                        </View>
                                    </View>
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', padding:12}}>
                                        <EntypoIcon name='mail' size={24} color='black' />
                                        <View style={{marginLeft:screenWidth*0.05, width:screenWidth*0.5}}>
                                            <Text style={{marginLeft:screenWidth*0.05}}>info@bdgprotection.com </Text>
                                        </View>
                                    </View>
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', padding:12}}>
                                        <EntypoIcon name='phone' size={24} color='black' />
                                        <View style={{marginLeft:screenWidth*0.05, width:screenWidth*0.5}}>
                                            <Text style={{marginLeft:screenWidth*0.05}}>+1 416-888-7133 </Text>
                                        </View>
                                    </View>

                                    <Text style={{textAlign:'center', marginVertical:30, fontSize:14}}>BDG Protection Services</Text>
                                    {
                                        Platform.OS === 'ios' &&
                                        <View style={{height:screenHeight*0.1}} />
                                    }
                                </LinearGradient>
                            </View>

                            {/* <View style={{height:screenHeight*0.1}} /> */}

                        </View>
                    </ScrollView>
                {/* </SafeAreaView> */}
                
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

export default HomePage;