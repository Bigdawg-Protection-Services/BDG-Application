import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class AddEntry extends Component {
    constructor(props){
        super(props);
        this.state = {
        }
    }
    render(){
        return(
            <View style={{height:screenHeight}}>
                <StatusBar backgroundColor="#2c3e50" barStyle='light-content' />
                <View style={{height:screenWidth*0.1}} />
                <LinearGradient style={{width:screenWidth, height:screenHeight, position:'absolute', zIndex:-1}} colors={['#2c3e50', '#4ca1af']}>
                </LinearGradient>

                <TouchableOpacity onPress={()=>{
                    let newObj = {
                        time: '05:00',
                        description: 'New description'
                    }
                    // this.props.navigation.state.params.onGoBack(newObj)
                    this.props.navigation.goBack()
                }}>
                    <Text style={{color:'white', marginLeft:20, fontFamily:'serif', fontSize:14}}>Back</Text>
                </TouchableOpacity>
                <View style={{flexDirection:'row', padding:12, justifyContent:'space-evenly', alignItems:'center'}}>
                    
                </View>

                <Text style={{position:'absolute', bottom:30, color:'#eee', fontSize:12, alignSelf:'center'}}>Big Dawg Protection services</Text>
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
      borderRadius: 0,
      paddingVertical: 35,
      width: screenWidth*0.85,
    },
});

export default AddEntry;