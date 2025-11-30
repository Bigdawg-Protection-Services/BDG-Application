import React, {Component} from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  View,
  Text,
  StatusBar,
  Modal,
  ImageBackground,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';

const axios = require('axios').default;
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import EntypoIcon from 'react-native-vector-icons/Entypo';
import * as ImagePicker from 'react-native-image-picker';
import ImgToBase64 from 'react-native-image-base64';
import URL from '../res/data/Environment';
import AwesomeAlert from 'react-native-awesome-alerts';
import IconEntypo from 'react-native-vector-icons/Entypo'
import IconMaterial from 'react-native-vector-icons/MaterialIcons'
import Snackbar from 'react-native-snackbar';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class CreateReport extends Component {
    constructor(props){
        super(props);
        this.state = {
            reportType: 'Select Report Type',
            reports: ['Daily report','Incident report'],
            reportMenuShow: false,
            location: 'Site Address',
            site: {
                id: "",
                name: "",
                location: ""
            },
            loaderVisible: false,
            reportString: '',
            startTime: '',
            showStartModal: false,
            endTime: '',
            showEndModal: false,
            entryTime: '',
            showEntryTimeModal: false,
            entryDescription: '',
            keyboardOpen: false,
            addEntryScreenOpen: false,
            reportEntries: [],
            editIndex: -1,
            isEditing: false,
            userName: '',
            userEmail: '',
            imageString: '',
            imgFileName: '',
            imgArr: [],
            firebaseUploadedImages: [],
            imgUploadCounter: 0,
            eraseAlert: false,
            siteArray: [],
            siteDisplay: 'Site Address',
            isSitesPopupVisible: false
        }
    }
    async readSavedReport(){
        try {
            let repoType = await AsyncStorage.getItem('@reportType')
            let repoLoc = await AsyncStorage.getItem('@reportLocation')
            let repoSiteId = await AsyncStorage.getItem('@reportSiteId')
            let repoSiteLoc = await AsyncStorage.getItem('@reportSiteLocation')
            let repoSiteName = await AsyncStorage.getItem('@reportSiteName')
            // let repoStr = await AsyncStorage.getItem('@reportString')
            let repoStartTime = await AsyncStorage.getItem('@reportStartTime')
            let repoEndTime = await AsyncStorage.getItem('@reportEndTime')
            let name = await AsyncStorage.getItem('@userName')
            let email = await AsyncStorage.getItem('@userEmail')

            let myArr = [], arr = [];
            myArr = await AsyncStorage.getItem('@reportImageArray');
            if (myArr !== null) {
                arr = JSON.parse(myArr)
                console.log('Read firebase Array is : ',arr)
            }

            let siteTemp1 = {
                id: repoSiteId != null?repoSiteId:'',
                name: repoSiteName != null?repoSiteName:'',
                location: repoSiteLoc != null?repoSiteLoc:''
            }


            console.log('RepoLoc read is : ',repoLoc,' : ',repoType)
            //console.log('Startime read is : ',repoStartTime,' : ',new Date(repoStartTime))
            //console.log('Endtime read is : ',repoEndTime,' : ',new Date(repoEndTime))
            //console.log('Token read is : ',name,' : ',email)
            
            this.setState({
                reportType: repoType!=null?repoType:'Select Report Type',
                location: repoLoc!=null?repoLoc:'Site Address',
                siteDisplay: repoLoc!=null?repoLoc:'Site Address',
                site: siteTemp1,
                // reportString: repoStr!=null?repoStr:'',
                startTime: repoStartTime!=null?repoStartTime:'',
                endTime: repoEndTime!=null?repoEndTime:'',
                userName: name,
                userEmail: email,
                firebaseUploadedImages: arr
            })
            
            //console.log('Saved report is : ',repoType,' : ',repoLoc,' : ',repoStr)
        } catch(e) { console.log('Token reading error ...',e) }
    }
    componentDidMount(){

        this.readSavedReport()
        this.readTempReport()
        this.getAllSites()

        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', ()=>{
            console.log('Keyboard open..')
            this.setState({ keyboardOpen: true })
        });
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', ()=>{
            console.log('Keyboard close..')
            this.setState({ keyboardOpen: false })
        });
    }
    componentWillUnmount(){
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }
    async getAllSites(){
        this.setState({ loaderVisible: true })
        let token='';
        try {
            token = await AsyncStorage.getItem('@loginToken')
        } catch(e) { console.log('token reading Error ...',e) }

        let url = URL.concat('api/sites?limit=1000&page=1')
        axios.get(url, {
            headers: {
                'Authorization': 'Bearer '.concat(token)
            }
        }) 
        .then(response => {
            //console.log('Sites are : ',response.data?.data?.data[0])
            this.setState({
                loaderVisible: false,
                siteArray: response.data?.data?.data
            })
        })
        .catch(error => {
            console.log('Shifts error : ',error);
            if(!error?.response){
                Snackbar.show({
                    text: 'Poor connection',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'Dismiss',
                      textColor: 'orange',
                      onPress: () => { Snackbar.dismiss() },
                    },
                });
            }
            this.setState({loaderVisible: false })
        })
    }
    async uploadImages(path, filename){
        this.setState({loaderVisible: true})
        let token = '';
        try {
            token = await AsyncStorage.getItem('@loginToken')
        } catch(e) { console.log('Token reading error ...',e) }

            let i = {
                uri: path,
                type: 'multipart/form-data',
                name: filename
            };
            
            const fData = new FormData();
            fData.append('file',i)
    
            let url1 = URL.concat('api/firebase')
            axios.post(url1, fData, {
                headers: {
                    'Authorization': 'Bearer '.concat(token),
                    'Content-Type': 'multipart/form-data; '
                }
            }) 
            .then(response => {
                //console.log('Image uploaded ..',response.data?.data?.doc)
                Toast.show('Image uploaded',Toast.LONG)

                let ptr = this.state.firebaseUploadedImages
                ptr.push({
                    filename: filename,
                    path: response.data?.data?.doc
                })
    
                this.setState({
                    firebaseUploadedImages: ptr,
                    loaderVisible: false                    
                })
            })
            .catch(error => {
                console.log('Image upload error : ',error); 
                Toast.show('Image uploaded',Toast.LONG)
                this.setState({loaderVisible: false, imgArr: this.state.imgArr.pop() })
            })
    }
    async sendReport(){
        //console.log('Firebase arrya is : ',this.state.firebaseUploadedImages)
        this.setState({loaderVisible: true })

        let token = '', id = '', name = '';
        try {
            token = await AsyncStorage.getItem('@loginToken')
            id = await AsyncStorage.getItem('@userId')
            name = await AsyncStorage.getItem('@userName')

            if(token !== null) {
                console.log('Token read is : ',id, ' : ', name)
            }
        } catch(e) { console.log('Token reading error ...',e) }

        let ss = '';
        this.state.reportEntries.map(obj=>{
            let obt = new Date(obj.time).toLocaleTimeString().substr(0,5)
            ss += ''.concat(obt).concat('  ').concat(obj.description).concat("\n")
        })
        console.log('=>',ss)

        let decl = '\n\n\nI  ____ '.concat(this.state.userName.toUpperCase()).concat(' ____ , authorize BDG Protection Services to fully use this as legal documentation. I consent for this report to be true and fully accurate. I consent for everything written in this report to be true and factual.\n\n').concat(this.state.userName).concat('\n').concat(this.state.userEmail)
        let msg = 'Report Type :'.concat(this.state.reportType).concat('\nSite Location : ').concat(this.state.location).concat('\nPlatform : ').concat(Platform.OS.toUpperCase()).concat('\n\nStart time : ').concat(this.state.startTime).concat('\nEnd Time : ').concat(this.state.endTime).concat('\n\n').concat(ss).concat(decl)

        if(this.state.firebaseUploadedImages.length > 0)
        {
            let url = URL.concat('api/reports')
            axios.post(url, {
                user: id,
                site: this.state.site.id,
                content: msg,
                location: this.state.location,
                reportType: this.state.reportType,
                startTime: this.state.startTime,
                endTime: this.state.endTime,
                attachments: this.state.firebaseUploadedImages 
            }, {
                headers: {
                    'Authorization': 'Bearer '.concat(token)
                }
            }) 
            .then(response => {
                this.setState({ loaderVisible: false, imageString: '' }); 
                Snackbar.show({
                    text: 'Report submitted',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'Dismiss',
                      textColor: 'green',
                      onPress: () => { Snackbar.dismiss() },
                    },
                });

                try {
                    AsyncStorage.removeItem('@reportType')
                    AsyncStorage.removeItem('@reportLocation')
                    AsyncStorage.removeItem('@reportSiteId')
                    AsyncStorage.removeItem('@reportSiteLocation')
                    AsyncStorage.removeItem('@reportSiteName')
                    AsyncStorage.removeItem('@reportArray')
                    AsyncStorage.removeItem('@reportStartTime')
                    AsyncStorage.removeItem('@reportEndTime')
                    AsyncStorage.removeItem('@reportImageArray')
                } catch (e) { console.log('report remove error : ',e) }
                this.props.navigation.goBack();
            })
            .catch(error => {
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
                    message = message? message:'Submission Failed';

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
        else 
        {
            let url = URL.concat('api/reports')
            axios.post(url, {
                user: id,
                site: this.state.site.id,
                content: msg,
                location: this.state.location,
                reportType: this.state.reportType,
                startTime: this.state.startTime,
                endTime: this.state.endTime
            }, {
                headers: {
                    'Authorization': 'Bearer '.concat(token)
                }
            }) 
            .then(response => {
                console.log('report submitted',response.data); 
                this.setState({ loaderVisible: false, imageString: '' }); 
                Snackbar.show({
                    text: 'Report submitted',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'Dismiss',
                      textColor: 'green',
                      onPress: () => { Snackbar.dismiss() },
                    },
                });
                try {
                    AsyncStorage.removeItem('@reportType')
                    AsyncStorage.removeItem('@reportLocation')
                    AsyncStorage.removeItem('@reportSiteId')
                    AsyncStorage.removeItem('@reportSiteLocation')
                    AsyncStorage.removeItem('@reportSiteName')
                    AsyncStorage.removeItem('@reportArray')
                    AsyncStorage.removeItem('@reportStartTime')
                    AsyncStorage.removeItem('@reportEndTime')
                    AsyncStorage.removeItem('@reportImageArray')
                } catch (e) { console.log('report remove error : ',e) }
                this.props.navigation.goBack();
            })
            .catch(error => {
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
                    message = message? message:'Submission Failed';

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
        
    }
    async saveTempReport(arr){
        try {
            await AsyncStorage.setItem('@reportArray', JSON.stringify(arr));
        } catch (error) { console.log('Error saving tempReport ..',error) }
    }
    async readTempReport(){
        try {
            let myArray = []
            myArray = await AsyncStorage.getItem('@reportArray');
            if (myArray !== null) {
                let arr = JSON.parse(myArray)
                //console.log('tempArray recieved is : ',arr,' : ',arr[0].description);
                this.setState({
                    reportEntries: arr
                })
            }
        } catch (error) {
            console.log('Error reading tempReport ..',error)
        }
    }
    selectImage(){
        let options = {
        };
        ImagePicker.launchImageLibrary(options, response => {
            let igarr = []; igarr = this.state.imgArr;

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                let source = { uri: response.assets[0].uri };
                console.log("AI image select response : ", response.assets);
                console.log( {source} );
                let iString = ''.concat('data:image/jpeg;base64,').concat(source?.uri);

                ImgToBase64.getBase64String(source?.uri)
                .then(response => {
                    console.log('imgTo64 response is success : ')
                    //console.log('File Name is : : ',source?.uri.split('/'))
                    let dumpName = []; dumpName = source?.uri?.split('/')

                    igarr.push({
                        filename: dumpName[dumpName.length-1], 
                        content: response,
                        encoding: 'base64',
                        path: source?.uri
                    })

                    this.setState({
                        imageString: response,
                        imgFileName: source?.uri,
                        imgArr: igarr
                    })

                    this.uploadImages(source?.uri, dumpName[dumpName.length-1])
                })
                .catch(err => console.log('Converting imgTo64 error : ',err))
            }

        });
    }
    async eraseReport(){
        try {
            AsyncStorage.removeItem('@reportType')
            AsyncStorage.removeItem('@reportLocation')
            AsyncStorage.removeItem('@reportArray')
            AsyncStorage.removeItem('@reportStartTime')
            AsyncStorage.removeItem('@reportEndTime')
            AsyncStorage.removeItem('@reportImageArray')
        } catch (e) { console.log('report remove error : ',e) }
        this.setState({
            reportType: 'Select report type',
            location: '',
            startTime: '',
            endTime: '',
            reportEntries: [],
            firebaseUploadedImages: [],
            loaderVisible: false,
            eraseAlert: false
        })
        Toast.show('Data erased',Toast.LONG);
    }

    render(){
        let stTime = new Date(this.state.startTime).toLocaleTimeString()
        // console.log('StartTime is : ',stTime )

        let etTime = new Date(this.state.endTime).toLocaleTimeString()
        // console.log('EndTime is : ',etTime)

        let adTime = new Date(this.state.entryTime).toLocaleTimeString()
        //console.log('Site : ', this.state.site)

        if(Platform.OS == 'ios' && adTime!= 'Invalid Date'){
            let zC = adTime.split(':')[0]
            if(zC.length==1){
                adTime = '0'.concat(adTime)
            }
            console.log('modified : ', adTime)
        }

        //console.log('Values are : ',this.state.isSitesPopupVisible,' : ',this.state.eraseAlert)
        return(
            <View>
                {/* <SafeAreaView> */}
                    {
                        !this.state.addEntryScreenOpen ?
                        <StatusBar translucent backgroundColor="transparent" barStyle='light-content' />
                        :
                        <StatusBar translucent backgroundColor="#2c3e50" barStyle='light-content' />
                    }
                    <ImageBackground source={require('../res/img/p3.png')} style={{ position:'absolute', width:screenWidth, height:screenHeight*1.1 }} />
                    <LinearGradient style={{width:screenWidth, height: screenHeight*1.1, 
                        position:'absolute', zIndex:-1}} colors={['#2c3e50', '#4ca1af']}>
                    </LinearGradient>
                    <ScrollView style={{height:screenHeight*1.05}}>
                    {
                        Platform.OS === 'ios' &&
                        <View style={{height:screenHeight*0.05}} />
                    }
                    <View style={{width:screenWidth}}>
                        {
                            Platform.OS == 'android' &&
                            <View style={{marginTop:screenHeight*0.05}} />
                        }
                        {/* Back and Erase button */}
                        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', 
                            paddingHorizontal:20, paddingVertical:12
                        }}>
                            <TouchableOpacity onPress={()=>{
                                this.props.navigation.goBack()
                            }} style={{zIndex:5}}>
                                <IconEntypo name="chevron-thin-left" color="white" size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>{
                                this.setState({
                                    eraseAlert: true
                                })
                            }} style={{zIndex:5, backgroundColor:'#9009', 
                                paddingHorizontal:15, paddingVertical:2
                            }}>
                                <Text style={{color:'white', fontSize:18}}>Erase Data</Text>
                            </TouchableOpacity>
                        </View>
                        <AwesomeAlert
                        show={this.state.eraseAlert}
                        showProgress={false}
                        closeOnTouchOutside={true}
                        closeOnHardwareBackPress={false}
                        showCancelButton={true}
                        showConfirmButton={true}
                        cancelText="Cancel"
                        confirmText="Erase"
                        confirmButtonColor="#900"
                        confirmButtonStyle={{width: screenWidth*0.3, alignItems:'center'}}
                        cancelButtonColor="#999"
                        cancelButtonStyle={{width: screenWidth*0.3, alignItems:'center'}}
                        customView={
                            <View style={{width:screenWidth*0.7}}>
                                <Text style={{textAlign:'center', fontSize:24}}>Confirm</Text>
                                <Text style={{textAlign:'center', fontSize:16, marginTop:8, color:'#888'}}>
                                    This will erase all the report data !!
                                </Text>
                                <View style={{height:screenHeight*0.05}} />
                            </View>
                        }
                        onCancelPressed={() => {
                            this.setState({
                                eraseAlert: false
                            })
                        }}
                        onConfirmPressed={() => {
                            this.eraseReport()
                        }}/>
                        
                        {/* Disclaimer */}
                        <View style={{paddingHorizontal:30, paddingVertical:15, marginTop:10, backgroundColor:'#0005'}}>
                            <Text style={{color:'white', fontSize:18}}>Important Note:</Text>
                            <Text style={{color:'white', marginTop:10, textAlign:'justify', fontSize:12}}>
                                User must SAVE the report before moving away from the screen. FAILED to do so may result in LOSE of data
                            </Text>
                        </View>
                        
                        {/* Report Type */}
                        <View style={{width:screenWidth*0.8, paddingVertical:10, alignSelf:'center'}}>
                            <Text style={{paddingVertical:12, marginLeft:5, color:'#fff'}}>Report Type</Text>
                            <TouchableOpacity onPress={()=>{
                                this.setState({reportMenuShow: !this.state.reportMenuShow})
                            }} style={{ backgroundColor:'#fff', padding:16, borderTopLeftRadius:4, borderTopRightRadius: 4}}>
                                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                                    <Text>{this.state.reportType}</Text>
                                    {/* <Text style={{transform:[{scaleX:1.3}], height:10}}>&#711;</Text> */}
                                    <EntypoIcon name="chevron-thin-down" size={16} color="black" />
                                </View>
                            </TouchableOpacity>
                            {
                                this.state.reportMenuShow &&
                                <View style={{backgroundColor:'white'}}>
                                    <TouchableOpacity onPress={()=>{
                                        this.setState({
                                            reportMenuShow: !this.state.reportMenuShow,
                                            reportType: 'Daily report'
                                        })
                                    }} style={{padding:16}}>
                                        <Text>Daily report</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={()=>{
                                        this.setState({
                                            reportMenuShow: !this.state.reportMenuShow,
                                            reportType: 'Incident report'
                                        })
                                    }} style={{padding:16}}>
                                        <Text>Incident report</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>
                        
                        {/* Location */}
                        <View style={{width:screenWidth*0.8, paddingVertical:10, alignSelf:'center'}}>
                            <Text style={{paddingVertical:12, marginLeft:5, color:'#fff'}}>Location</Text>
                            <TouchableOpacity onPress={()=>{
                                this.setState({ isSitesPopupVisible: true })
                            }} style={{padding:16, backgroundColor:'white', color:'#555', borderRadius:5}}>
                                <Text style={{color: this.state.siteDisplay==='Site Address'? '#aaa':'#000' }}>{this.state.location}</Text>
                            </TouchableOpacity>
                            {/* <TextInput
                            value={this.state.location}
                            placeholder="Site / Location"
                            placeholderTextColor="#aaa"
                            onChangeText={val=>{this.setState({location: val})}}
                            style={{padding:16, backgroundColor:'white', color:'#555', borderRadius:5}} /> */}
                        </View>

                        {/* Start time */}
                        <View style={{width:screenWidth*0.8, paddingVertical:10, alignSelf:'center'}}>
                            <Text style={{paddingVertical:12, marginLeft:5, color:'#fff'}}>Start Time</Text>
                            <TouchableOpacity onPress={()=>{this.setState({ showStartModal: true })}} style={{
                                padding:16, backgroundColor:'white', borderRadius:5
                            }}>
                                {
                                    stTime != 'Invalid Date' ?
                                    <Text style={{color:'#000'}}>{stTime}</Text>
                                    :
                                    <Text style={{color:'#aaa'}}>Shift start time</Text>
                                }
                            </TouchableOpacity>
                            <DateTimePickerModal
                            isVisible={this.state.showStartModal}
                            mode="time"
                            locale="en_CA"
                            date={new Date()}
                            onConfirm={(time) => { this.setState({showStartModal: false, startTime: time}) }}
                            onCancel={()=>{ this.setState({showStartModal: false}) }}/>
                        </View>

                        {/* End Time */}
                        <View style={{width:screenWidth*0.8, paddingVertical:10, alignSelf:'center'}}>
                            <Text style={{paddingVertical:12, marginLeft:5, color:'#fff'}}>End Time</Text>
                            <TouchableOpacity onPress={()=>{this.setState({ showEndModal: true })}} style={{
                                padding:16, backgroundColor:'white', borderRadius:5
                            }}>
                                {
                                    etTime != 'Invalid Date' ?
                                    <Text style={{color:'#000'}}>{etTime}</Text>
                                    :
                                    <Text style={{color:'#aaa'}}>Shift end time</Text>
                                }
                            </TouchableOpacity>
                            <DateTimePickerModal
                            isVisible={this.state.showEndModal}
                            mode="time"
                            locale="en_CA"
                            date={new Date()}
                            onConfirm={(time) => { this.setState({showEndModal: false, endTime: time}) }}
                            onCancel={()=>{ this.setState({showEndModal: false}) }}/>
                        </View>

                        <View style={{width:screenWidth*0.8, paddingVertical:10, alignSelf:'center'}}>
                            <Text style={{paddingVertical:12,  color:'#fff', fontSize:20}}>Narrative report</Text>
                        </View>

                        {/* Report View */}
                        <View>
                            <View style={{width:screenWidth*0.8, flexDirection:'row', justifyContent:'center', padding:4, borderWidth:1, borderColor:'white', alignSelf:'center', backgroundColor:'white'}}>
                                <Text style={{width:screenWidth*0.3, color:'#2c3e50', padding:8, textAlign:'center', borderColor:'#2c3e50', borderRightWidth:1}}>Time</Text>
                                <Text style={{width:screenWidth*0.55, color:'#2c3e50', padding:8, textAlign:'center', marginLeft:5}}>Description</Text>
                            </View>
                            {
                                this.state.reportEntries.map((obj, index)=>{
                                    //console.log('=>',obj,':  ',index)
                                    let objTime = new Date(obj.time).toLocaleTimeString().substr(0,5)
                                    if(objTime.charAt(objTime.length-1) == ':'){
                                        console.log("Here...")
                                        objTime = objTime.substr(0,objTime.length-1)
                                    }
                                    return(
                                        <TouchableOpacity onPress={()=>{
                                            console.log('Pressed is : =>',obj.time,':  ',new Date(obj.time))
                                            this.setState({
                                                entryTime: obj.time,
                                                entryDescription: obj.description,
                                                addEntryScreenOpen: !this.state.addEntryScreenOpen,
                                                isEditing: true,
                                                editIndex: index
                                            })
                                        }} key={Math.random()} style={{flexDirection:'row', justifyContent:'center', marginTop:0, borderWidth:1, borderColor:'#fff', alignItems:'center', width:screenWidth*0.85, alignSelf:'center' }}>
                                            <Text style={{width:screenWidth*0.3, padding:8, textAlign:'center', color:'white', borderRightWidth:1, borderColor:'white'}}>
                                                {objTime}
                                            </Text>
                                            <Text style={{width:screenWidth*0.55, padding:12, textAlign:'justify', marginLeft:5, color:'white'}}>
                                                {obj.description}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })
                            }
                            {
                                this.state.reportEntries.length<=0 &&
                                <View style={{width:screenWidth*0.8, flexDirection:'row', justifyContent:'center', padding:4, borderWidth:1, borderColor:'white', alignSelf:'center', }}>
                                    <Text style={{width:screenWidth*0.3, color:'#2c3e50', padding:8, textAlign:'center', }}></Text>
                                    <Text style={{width:screenWidth*0.55, color:'#2c3e50', padding:8, textAlign:'center', marginLeft:5}}></Text>
                                </View>
                            }
                        </View>

                        {/* Add Entry */}
                        <TouchableOpacity onPress={()=>{
                            this.setState({
                                addEntryScreenOpen: !this.state.addEntryScreenOpen
                            })
                        }} style={{
                            backgroundColor:'#eee', width:screenWidth*0.8, alignSelf:'flex-end',
                            marginRight:screenWidth*0.10, borderRadius:4 , marginTop:20
                        }}>
                            <Text style={{padding:10, textAlign:'center'}}>Add Entry</Text>
                        </TouchableOpacity>

                        {/* Save Report */}
                        <TouchableOpacity onPress={()=>{
                            console.log('Storing values are : ',this.state.startTime,' : ',this.state.endTime)
                            try {
                                AsyncStorage.setItem('@reportType', this.state.reportType)
                                AsyncStorage.setItem('@reportLocation', this.state.location)
                                AsyncStorage.setItem('@reportSiteId', this.state.site.id)
                                AsyncStorage.setItem('@reportSiteLocation', this.state.site.location)
                                AsyncStorage.setItem('@reportSiteName', this.state.site.name)
                                AsyncStorage.setItem('@reportString', this.state.reportString)
                                AsyncStorage.setItem('@reportStartTime', new Date(this.state.startTime).toString())
                                AsyncStorage.setItem('@reportEndTime', new Date(this.state.endTime).toString())
                                AsyncStorage.setItem('@reportImageArray', JSON.stringify(this.state.firebaseUploadedImages))
                                Toast.show('Report saved',Toast.LONG);
                            } catch (e) { console.log('report info save error : ',e) }
                        }} style={{
                            backgroundColor:'#eee', width:screenWidth*0.8, alignSelf:'flex-end',
                            marginRight:screenWidth*0.10, borderRadius:4 , marginTop:20
                        }}>
                            <Text style={{padding:10, textAlign:'center'}}>Save Report</Text>
                        </TouchableOpacity>

                        
                        <View style={{width:screenWidth*0.8, paddingVertical:10, alignSelf:'center', marginTop:20}}>
                            <Text style={{paddingVertical:12,  color:'#fff', fontSize:20}}>Attachments</Text>
                        </View>
                        {
                            this.state.firebaseUploadedImages.map(obj => {
                                return(
                                    <Text key={Math.random()} style={{color:'white', fontSize:12, paddingVertical:8, width:screenWidth*0.8, alignSelf:'center'}}>{''.concat(obj.filename).replace('rn_image_picker_lib_temp_','')}
                                    </Text>
                                )
                            })
                        }
                        <TouchableOpacity onPress={()=>{
                            this.selectImage()
                        }} style={{
                            backgroundColor:'#eee', width:screenWidth*0.8, alignSelf:'flex-end',
                            marginRight:screenWidth*0.10, borderRadius:4 , marginTop:10
                        }}>
                            <Text style={{padding:10, textAlign:'center'}}>Add Image</Text>
                        </TouchableOpacity>

                        {/* Send Report */}
                        <TouchableOpacity onPress={()=>{
                            if(this.state.reportType=='Daily report' || this.state.reportType=='Incident report'){
                                if(this.state.site.location.length > 0){
                                    if(this.state.reportEntries.length > 0){
                                        this.sendReport()
                                    }else{
                                        Snackbar.show({
                                            text: 'Report cannot be empty',
                                            duration: Snackbar.LENGTH_SHORT,
                                            action: {
                                              text: 'Dismiss',
                                              textColor: 'red',
                                              onPress: () => { Snackbar.dismiss() },
                                            },
                                        });
                                    }
                                    console.log(this.state.location,' : ',this.state.startTime,' : ',this.state.endTime,' : ',this.state.reportType,' : ',this.state.reportEntries.length)
                                }else{
                                    Snackbar.show({
                                        text: 'Select Location',
                                        duration: Snackbar.LENGTH_SHORT,
                                        action: {
                                          text: 'Dismiss',
                                          textColor: 'red',
                                          onPress: () => { Snackbar.dismiss() },
                                        },
                                    });
                                }
                            }else {
                                Snackbar.show({
                                    text: 'Select Report Type',
                                    duration: Snackbar.LENGTH_SHORT,
                                    action: {
                                      text: 'Dismiss',
                                      textColor: 'red',
                                      onPress: () => { Snackbar.dismiss() },
                                    },
                                });
                            }
                            // try {
                            //     AsyncStorage.removeItem('@reportType')
                            //     AsyncStorage.removeItem('@reportLocation')
                            //     AsyncStorage.removeItem('@reportArray')
                            //     AsyncStorage.removeItem('@reportStartTime')
                            //     AsyncStorage.removeItem('@reportEndTime')
                            // } catch (e) { console.log('report remove error : ',e) }
                        }} style={{width:screenWidth*0.8, padding:20, borderRadius:4, backgroundColor:'#2c3e50', alignSelf:'center', marginTop:50}}>
                            <Text style={{color:'white', fontSize:16, alignSelf:'center'}}>Submit report</Text>
                        </TouchableOpacity>
                        {
                            screenHeight < 800 &&
                            <View style={{height:50}} />
                        }
                        {
                            Platform.OS === 'ios'?
                            <View style={{height:70}} />
                            :
                            <View style={{height:20}} />
                        }

                        {
                            this.state.keyboardOpen &&
                            <View style={{height:screenHeight*0.3}} />
                        }
                    </View>
                        {
                            Platform.OS == 'ios' &&
                            <View style={{marginTop:screenHeight*0.05}} />
                        }
                    </ScrollView>
                {
                    this.state.loaderVisible &&
                    <View style={{width:screenWidth, height:screenHeight*1.1, backgroundColor:'#0009', position:'absolute', justifyContent:'center', alignItems:'center'}}>
                        <ActivityIndicator size={42} color="#aaa">
                        </ActivityIndicator>
                    </View>
                }

                {
                    this.state.addEntryScreenOpen &&
                    <Modal
                    animationType='fade'
                    transparent={true}
                    visible={this.state.pickUpModal}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <ImageBackground source={require('../res/img/p3.png')} style={{ position:'absolute', width:screenWidth, height:screenHeight*1.1 }} />   
                                <LinearGradient style={{width:screenWidth, height:screenHeight, position:'absolute', zIndex:-1}} colors={['#2c3e50', '#4ca1af']}></LinearGradient>
                                <View style={{height:50}} />
                                <TouchableOpacity onPress={()=>{this.setState({
                                    addEntryScreenOpen: !this.state.addEntryScreenOpen,
                                    isEditing: false,
                                    editIndex: -1
                                })}} style={{ zIndex:5, marginLeft:25, marginTop:10}}>
                                    <EntypoIcon name="chevron-thin-left" color="white" size={26} />
                                    {/* <Text style={{fontSize:26, color:'white', transform: [{scaleY:1.3}, {scaleX:1.2}] }}> &#8249; </Text> */}
                                </TouchableOpacity>
                                <View style={{width:screenWidth*0.8, paddingVertical:10, alignSelf:'center'}}>
                                    <Text style={{paddingVertical:12, marginLeft:5, color:'#fff'}}>Add Time</Text>
                                    <TouchableOpacity onPress={()=>{this.setState({ showEntryTimeModal: true })}} style={{
                                        padding:16, backgroundColor:'white', borderRadius:4
                                    }}>
                                        {
                                            adTime != 'Invalid Date' ?
                                            <Text style={{color:'#000'}}>{adTime.substr(0,5)}</Text>
                                            :
                                            <Text style={{color:'#aaa'}}>Add time</Text>
                                        }
                                    </TouchableOpacity>
                                    <DateTimePickerModal
                                    isVisible={this.state.showEntryTimeModal}
                                    mode="time"
                                    locale="en_CA"
                                    date={new Date()}
                                    onConfirm={(time) => { 
                                        console.log('Add entryTime is : ',time)
                                        this.setState({showEntryTimeModal: false, entryTime: time}) 
                                    }}
                                    onCancel={()=>{ this.setState({showEntryTimeModal: false}) }}/>
                                </View>
                                <View style={{width:screenWidth*0.8, paddingVertical:10, alignSelf:'center'}}>
                                    <Text style={{paddingVertical:12, marginLeft:5, color:'#fff'}}>Narrative Text</Text>
                                    <TextInput
                                    value={this.state.entryDescription}
                                    multiline={true}
                                    blurOnSubmit={true}
                                    onChangeText={val=>{this.setState({entryDescription: val})}}
                                    style={{minHeight:150, padding:16, backgroundColor:'white', color:'#555', borderRadius:4, textAlign:'justify', textAlignVertical:'top'}} />
                                </View>
                                <TouchableOpacity onPress={()=>{
                                    let arr = this.state.reportEntries
                                    let newObj = {
                                        time: this.state.entryTime,
                                        description: this.state.entryDescription
                                    }
                                    if(this.state.isEditing){
                                        arr[this.state.editIndex] = newObj
                                    }else{
                                        arr.push(newObj)
                                    }
                                    this.saveTempReport(arr)

                                    this.setState({
                                        addEntryScreenOpen: !this.state.addEntryScreenOpen,
                                        reportEntries: arr,
                                        entryTime: '',
                                        entryDescription: '',
                                        isEditing: false,
                                        editIndex: -1
                                    })
                                }} style={{width:screenWidth*0.8, padding:20, borderRadius:4, backgroundColor:'#2c3e50', alignSelf:'center', marginTop:50}}>
                                    {
                                        this.state.isEditing == true?
                                        <Text style={{color:'white', fontSize:16, alignSelf:'center'}}>Edit Entry</Text>
                                        :
                                        <Text style={{color:'white', fontSize:16, alignSelf:'center'}}>Add Entry</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                }
                <AwesomeAlert
                show={this.state.isSitesPopupVisible}
                showProgress={false}
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
                customView={
                    <View style={{width: screenWidth*0.8, justifyContent: 'center', alignItems:'center', position:'relative'}}>
                        <Text style={{ textAlign:'left', marginVertical: 12, fontSize:18, fontWeight:'bold'}}>Select Location</Text>
                        <View style={{width: screenWidth*0.7, height: screenWidth*0.7, justifyContent:'center', alignItems:'center'}}>
                            <ScrollView>
                                {
                                    this.state.siteArray.length>0? this.state.siteArray.map((site, index) => (
                                        <TouchableOpacity onPress={()=>{
                                            this.setState({
                                                siteDisplay: site.location,
                                                isSitesPopupVisible: false,
                                                location: site.location,
                                                site: {
                                                    id: site._id,
                                                    name: site.name,
                                                    location: site.location
                                                }
                                            })
                                        }} key={index} style={{width: screenWidth*0.65, height: 48, backgroundColor:'#fff', marginVertical: 8, justifyContent:'center',
                                            borderBottomWidth:1, borderBottomColor: '#ddd'
                                        }}>
                                            <Text style={{marginVertical:4, fontWeight: '500'}}>{site.name}</Text>
                                            <Text style={{marginBottom:8, fontSize: 12}}>{site.location}</Text>
                                        </TouchableOpacity>
                                    ))
                                    :
                                    <Text style={{marginVertical:24, fontWeight: '500'}}>Poor connection, unable to check the sites. Please close the reports and try again</Text>
                                }
                            </ScrollView>
                        </View>
                        <TouchableOpacity onPress={()=>{
                            this.setState({ isSitesPopupVisible: false })
                        }} style={{position: 'absolute', top: 12, right: 18}}>
                            <IconMaterial name="clear" size={26} color="black" />
                        </TouchableOpacity>
                    </View>
                }
                showCancelButton={false}
                onCancelPressed={() => {
                    this.setState({ isSitesPopupVisible: false })
                }} />

                {/* </SafeAreaView> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    centeredView: {
    width:screenWidth,
    height: screenHeight,  
    //justifyContent: "center",
    //alignItems: "center",
    backgroundColor:'#0009',
    },
    modalView: {
      paddingVertical: 0,
      width: screenWidth,
      height:screenHeight,
    },
});

export default CreateReport;
