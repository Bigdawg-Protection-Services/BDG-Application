import React from 'react';
import {
  StyleSheet,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from './views/SplashScreen';
import Authenticate from './views/Authenticate';
import Dashboard from './views/Dashboard';
import CreateReport from './views/CreateReport';
import AddEntry from './views/AddEntry';
import CameraView from './views/CameraView';
import ShiftView from './views/Shifts';
import HelpView from './views/HelpView';
import SettingsView from './views/Settings';
import HomePage from './views/HomePage';
import { ForgotPassword } from './views/ForgotPassword';

const MyTheme = {
  dark: false,
  colors: {
    primary: 'rgb(255, 45, 85)',
    background: 'rgb(242, 242, 242)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(28, 28, 30)',
    border: 'rgb(199, 199, 204)',
    notification: 'rgb(255, 69, 58)',
  },
};

function App(){
  
  return (
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator initialRouteName="Authenticate" screenOptions={{
          headerShown: false,
        }}>
            <Stack.Screen name='Splash' component={SplashScreen} />
            <Stack.Screen name='Authenticate' component={Authenticate} />
            <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
            <Stack.Screen name='Dashboard' component={Dashboard} />
            <Stack.Screen name='CreateReport' component={CreateReport} />
            <Stack.Screen name='AddEntry' component={AddEntry} />
            <Stack.Screen name='CameraView' component={CameraView} />
            <Stack.Screen name='ShiftView' component={ShiftView} />
            <Stack.Screen name='HelpView' component={HelpView} />
            <Stack.Screen name='SettingsView' component={SettingsView} />
            <Stack.Screen name='HomePage' component={HomePage} />
          </Stack.Navigator>
      </NavigationContainer> 
  );
};


const Stack = createStackNavigator();

const styles = StyleSheet.create({

});

export default App;
