import React, {Component} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StatusBar,
  Dimensions,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

import LinearGradient from 'react-native-linear-gradient';
import IconEntypo from 'react-native-vector-icons/Entypo'

class HelpView extends Component {
    constructor(props){
        super(props);
        this.state = {
            curDate: new Date()
        }
    }
    componentDidMount(){
    }

    render(){
        return(
            <View>
                <StatusBar translucent backgroundColor="transparent" barStyle='light-content' />
                <SafeAreaView style={{height:screenHeight}}>
    
                    <ImageBackground source={require('../res/img/p3.png')} style={{ position:'absolute', width:screenWidth, height:screenHeight*1.1 }} />
                    <LinearGradient style={{width:screenWidth, height:screenHeight*1.1, position:'absolute', zIndex:-1}} colors={['#2c3e50', '#4ca1af']}></LinearGradient>

                    <ScrollView>
                    <View style={{marginTop:screenHeight*0.01}} />
                    <TouchableOpacity onPress={()=>{
                        this.props.navigation.goBack()
                    }} style={{marginTop:40, marginLeft:20}}>
                        <IconEntypo name="chevron-thin-left" color="white" size={24} />
                    </TouchableOpacity>
                    <Image source={require('../res/img//p1.png')} style={{width:screenWidth, height:180}} resizeMode="contain" />
                    <Text style={{color:'white', padding:26, textAlign:'justify', fontSize:16}}>
                        Incase of any emergency, and any functional malfunction, please contact the admin immidietaly, 
                        using below details. Do not leave the site before consulting the technical team or administrator 
                        regarding the issue.
                    </Text>
                    <Text style={{color:'white', fontSize:30, padding:24}}>Contact </Text>
                    <View style={{paddingHorizontal:24, paddingVertical:12}}>
                        <Text style={{color:'white', fontSize:16}}>Mobile: +1 416-888-7133</Text>
                        <Text style={{color:'white', fontSize:16}}>Email: egordon@bdgprotection.com</Text>
                    </View>
                    <View style={{padding:24}}>
                        <Text style={{color:'white', fontSize:16}}>Mobile: +1 416-888-7133</Text>
                        <Text style={{color:'white', fontSize:16}}>Email: gdavis@bdgprotection.com</Text>
                    </View>

                    <Text style={{color:'white', fontSize:12, textAlign:'center', paddingTop:24}}>Powered by Bdg Protection</Text>
                    <Text style={{color:'white', fontSize:12, textAlign:'center', paddingBottom:24}}></Text>

                    {/* <Text style={{color:'#eee', fontSize:14, alignSelf:'center', position:'absolute', bottom:0}}>BDG Protection services</Text> */}

                    </ScrollView>
                </SafeAreaView>
            </View>
        );
    }
}

export default HelpView;