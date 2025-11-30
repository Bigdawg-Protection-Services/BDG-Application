import React, { useState} from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  Platform,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const axios = require('axios').default;
import URL from '../res/data/Environment';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Snackbar from 'react-native-snackbar';

export const ForgotPassword = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSecondScreen, setIsSecondScreen] = useState(false);

  const emailResetCall = () => {
    setIsLoading(true);
    axios
      .post(URL.concat('api/send-otp'), {
        email: email,
      })
      .then(response => {
        console.log('Password reset data is', response.data);
        setIsLoading(false);
        setIsSecondScreen(true);
        Snackbar.show({
          text: response.data.message,
          duration: Snackbar.LENGTH_SHORT,
          action: {
            text: 'Dismiss',
            textColor: 'green',
            onPress: () => {
              Snackbar.dismiss();
            },
          },
        });
      })
      .catch(error => {
        console.log('Password reset error : ', error.message);
        setIsLoading(false);
        Snackbar.show({
          text: 'Request Failed',
          duration: Snackbar.LENGTH_LONG,
          action: {
            text: 'Dismiss',
            textColor: 'red',
            onPress: () => {
              Snackbar.dismiss();
            },
          },
        });
      });
  };
  const passwordResetCall = () => {
    setIsLoading(true);
    axios
      .patch(URL.concat('api/reset-password'), {
        otp: otp,
        email: email,
        password: confirmPassword,
      })
      .then(response => {
        console.log('Password reset data is', response.data);
        setIsLoading(false);
        navigation.goBack();
        Snackbar.show({
          text: response.data.message,
          duration: Snackbar.LENGTH_SHORT,
          action: {
            text: 'Dismiss',
            textColor: 'green',
            onPress: () => {
              Snackbar.dismiss();
            },
          },
        });
      })
      .catch(error => {
        console.log('Password reset error : ', error);
        setIsLoading(false);
        Snackbar.show({
          text: 'Password update failed',
          duration: Snackbar.LENGTH_LONG,
          action: {
            text: 'Dismiss',
            textColor: 'red',
            onPress: () => {
              Snackbar.dismiss();
            },
          },
        });
      });
  };

  return (
    <View
      style={{
        width: screenWidth,
        height: screenHeight,
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 60 : 70,
          left: 30,
        }}>
        <MaterialIcon name="arrow-back-ios" size={24} />
      </TouchableOpacity>
      <View
        style={{
          height: screenHeight * 0.2,
          width: screenWidth * 0.8,
          backgroundColor: 'transparent',
        }}
      />

      {!isSecondScreen && (
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 24}}>Forgot your Password ?</Text>
          <Text
            style={{
              fontSize: 14,
              color: '#999',
              width: screenWidth * 0.95,
              padding: 8,
              textAlign: 'center',
            }}>
            Enter your email and we'll send you a reset OTP
          </Text>
          <View style={{height: screenHeight * 0.02}} />
          <TextInput
            value={email}
            placeholder="Email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={val => setEmail(val)}
            style={{
              color: '#555',
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 4,
              width: screenWidth * 0.85,
              paddingLeft: 12,
              marginLeft: 0,
              alignSelf: 'center',
              marginTop: 30,
              paddingVertical: Platform.OS === 'ios' ? 15 : 10,
            }}
          />
          <TouchableOpacity
            onPress={emailResetCall}
            style={{
              backgroundColor: 'black',
              width: screenWidth * 0.85,
              alignSelf: 'center',
              padding: 18,
              borderRadius: 4,
              marginTop: 20,
            }}>
            <Text style={{textAlign: 'center', color: 'white'}}>SEND OTP</Text>
          </TouchableOpacity>
        </View>
      )}

      {isSecondScreen && (
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 24}}>Update your Password</Text>
          <Text
            style={{
              fontSize: 14,
              color: '#999',
              width: screenWidth * 0.95,
              padding: 8,
              textAlign: 'center',
            }}>
            Enter OTP sent to the email
          </Text>
          <View style={{height: screenHeight * 0.02}} />
          <TextInput
            value={otp}
            placeholder="OTP"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            onChangeText={val => setOTP(val)}
            style={{
              color: '#555',
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 4,
              width: screenWidth * 0.85,
              paddingLeft: 12,
              marginLeft: 0,
              alignSelf: 'center',
              marginTop: 30,
              paddingVertical: Platform.OS === 'ios' ? 15 : 10,
            }}
          />
          <TextInput
            value={password}
            placeholder="Password"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            onChangeText={val => setPassword(val)}
            secureTextEntry={true}
            style={{
              color: '#555',
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 4,
              width: screenWidth * 0.85,
              paddingLeft: 12,
              marginLeft: 0,
              alignSelf: 'center',
              marginTop: 30,
              paddingVertical: Platform.OS === 'ios' ? 15 : 10,
            }}
          />
          <TextInput
            value={confirmPassword}
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            onChangeText={val => setConfirmPassword(val)}
            secureTextEntry={true}
            style={{
              color: '#555',
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 4,
              width: screenWidth * 0.85,
              paddingLeft: 12,
              marginLeft: 0,
              alignSelf: 'center',
              marginTop: 30,
              paddingVertical: Platform.OS === 'ios' ? 15 : 10,
            }}
          />
          <TouchableOpacity
            onPress={passwordResetCall}
            style={{
              backgroundColor: 'black',
              width: screenWidth * 0.85,
              alignSelf: 'center',
              padding: 18,
              borderRadius: 4,
              marginTop: 20,
            }}>
            <Text style={{textAlign: 'center', color: 'white'}}>
              Update Password
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && (
        <View
          style={{
            width: screenWidth,
            height: screenHeight * 1.1,
            backgroundColor: '#0005',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size={42} color="#fff" />
        </View>
      )}
    </View>
  );
};
