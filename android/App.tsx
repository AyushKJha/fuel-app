import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Alert,BackHandler,Linking,Platform,Pressable,StyleSheet,Text,View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {manipulateAsync,SaveFormat} from 'expo-image-manipulator';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import {File,Paths} from 'expo-file-system';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import {notificationPermission,clearReminders,restoreReminders,updateReminders} from './reminders';
const HOME='https://fuel-journal.vercel.app/',ORIGIN='https://fuel-journal.vercel.app';
const INFO={version:'0.3.0',versionCode:4,notifications:true,sharing:true};
const INFO_SCRIPT=`window.__fuelNative=${JSON.stringify(INFO)};window.dispatchEvent(new CustomEvent('fuel-native-ready'));true;`;
function trusted(url:string){try{return new URL(url).origin===ORIGIN;}catch{return false;}}
type Delivery={requestId:string;base64?:string;canceled?:boolean;error?:string};
function Tracker(){
 const browser=useRef<WebView>(null),picking=useRef(false),ready=useRef(false),pending=useRef<Delivery|null>(null),path=useRef('/'),summary=useRef(false),loadTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [canGoBack,setCanGoBack]=useState(false),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false),[journal,setJournal]=useState(false),[source,setSource]=useState(HOME),[status,setStatus]=useState('Opening your journal…');
 function inject(script:string){browser.current?.injectJavaScript(script+';true;');}
 function report(detail:{error?:string;message?:string}){if(detail.error)setStatus(detail.error);inject(`window.dispatchEvent(new CustomEvent('fuel-native-status',{detail:${JSON.stringify(detail)}}))`);}
 function deliver(){if(!pending.current)return;inject(`(function(){if(location.origin!==${JSON.stringify(ORIGIN)})return;if(typeof window.__fuelHandleNativePhoto==='function')window.__fuelHandleNativePhoto(${JSON.stringify(pending.current)});else window.ReactNativeWebView.postMessage(JSON.stringify({type:'fuel-photo-not-ready'}));})()`);}
 function queue(result:Delivery){pending.current=result;deliver();}
 async function convert(result:ImagePicker.ImagePickerResult,requestId:string){if(result.canceled){queue({requestId,canceled:true});return;}const asset=result.assets[0];if(!asset?.uri)throw Error('Android did not return a photo.');const actions=Math.max(asset.width,asset.height)>1600?[{resize:asset.width>=asset.height?{width:1600}:{height:1600}}]:[];const photo=await manipulateAsync(asset.uri,actions,{compress:.8,format:SaveFormat.JPEG,base64:true});if(!photo.base64||photo.base64.length>6.6*1024*1024)throw Error('Choose a smaller image.');queue({requestId,base64:photo.base64});}
 async function pick(camera:boolean,requestId='native-'+Date.now()){
  if(picking.current){report({message:'A photo picker is already open.'});return;}
  if(!journal&&!ready.current){Alert.alert('Open your journal first','Sign in, then use Camera or Photos. If the journal is visible, tap Refresh to reconnect the photo controls.');return;}
  picking.current=true;setStatus(camera?'Opening Android camera…':'Opening Android photos…');inject("window.dispatchEvent(new CustomEvent('fuel-picker-started'))");
  try{if(camera){const permission=await ImagePicker.requestCameraPermissionsAsync();if(!permission.granted){const error='Camera permission is off. Allow it in Android Settings, or choose Photos.';queue({requestId,error});Alert.alert('Allow camera access',error,[{text:'Cancel',style:'cancel'},{text:'Open settings',onPress:()=>Linking.openSettings()}]);return;}}
   const options:ImagePicker.ImagePickerOptions={mediaTypes:['images'],quality:.85,exif:false,allowsEditing:false};
   // The Android document/gallery intent works across devices with differing photo-picker implementations.
   const result=camera?await ImagePicker.launchCameraAsync(options):await ImagePicker.launchImageLibraryAsync({...options,legacy:true});await convert(result,requestId);
  }catch(error){const message=error instanceof Error?error.message:'Try another photo or refresh Fuel.';queue({requestId,error:message});Alert.alert('Photo could not open',message+'\nFuel '+INFO.version);}
  finally{picking.current=false;setStatus('Fuel '+INFO.version+' · Camera and Photos ready');}
 }
 function openSummary(){summary.current=true;if(ready.current){inject("window.dispatchEvent(new CustomEvent('fuel-summary'))");summary.current=false;}else{setFailed(false);setSource(HOME+'?summary=1');}}
 useEffect(()=>{restoreReminders().catch(()=>{});ImagePicker.getPendingResultAsync().then(result=>{if(result&&'assets'in result)return convert(result as ImagePicker.ImagePickerResult,'recovered-'+Date.now());}).catch(()=>Alert.alert('Photo interrupted','Please choose your photo again.'));Notifications.getLastNotificationResponseAsync().then(response=>{if(response?.notification.request.content.data?.summary)openSummary();});const subscription=Notifications.addNotificationResponseReceivedListener(response=>{if(response.notification.request.content.data?.summary)openSummary();});return()=>{subscription.remove();if(loadTimer.current)clearTimeout(loadTimer.current);};},[]);
 useEffect(()=>{if(Platform.OS!=='android')return;const subscription=BackHandler.addEventListener('hardwareBackPress',()=>{if(path.current==='/welcome')return false;if(['/','/offline','/login','/auth/callback'].includes(path.current)){inject(`(function(){if(location.origin!==${JSON.stringify(ORIGIN)})return;var handled=!window.dispatchEvent(new CustomEvent('fuel-back',{cancelable:true}));if(!handled)location.replace(${JSON.stringify(ORIGIN+'/welcome')});})()`);return true;}if(!canGoBack)return false;browser.current?.goBack();return true;});return()=>subscription.remove();},[canGoBack]);
 async function message(event:{nativeEvent:{url:string;data:string}}){if(!trusted(event.nativeEvent.url))return;try{const value=JSON.parse(event.nativeEvent.data);switch(value.type){
  case 'fuel-photo':if(typeof value.camera==='boolean')await pick(value.camera,typeof value.requestId==='string'?value.requestId.slice(0,100):undefined);break;
  case 'fuel-photo-ready':ready.current=true;setJournal(true);inject(INFO_SCRIPT);deliver();if(summary.current){inject("window.dispatchEvent(new CustomEvent('fuel-summary'))");summary.current=false;}break;
  case 'fuel-photo-ack':if(value.requestId===pending.current?.requestId)pending.current=null;break;
  case 'fuel-photo-not-ready':ready.current=false;break;
  case 'fuel-request-info':inject(INFO_SCRIPT);break;
  case 'fuel-reminder':await updateReminders(value);break;
  case 'fuel-enable-notifications':report(await notificationPermission()?{message:'Android notifications enabled. Save your reminder settings.'}:{error:'Notifications are off. Enable Fuel notifications in Android Settings.'});break;
  case 'fuel-logout':pending.current=null;ready.current=false;setJournal(false);await clearReminders();break;
  case 'fuel-update':if(typeof value.url==='string'&&value.url.startsWith('https://expo.dev/artifacts/eas/')&&value.url.endsWith('.apk'))await Linking.openURL(value.url);else throw Error('Update URL was not trusted.');break;
  case 'fuel-export':{if(typeof value.text!=='string'||value.text.length>5*1024*1024||!['json','csv'].includes(value.format))throw Error('Export is too large. Export fewer meals from the website.');if(!await Sharing.isAvailableAsync())throw Error('Android sharing is unavailable on this device.');const name='fuel-journal.'+value.format,file=new File(Paths.cache,name);file.create({overwrite:true});file.write(value.text);try{await Sharing.shareAsync(file.uri,{mimeType:value.format==='json'?'application/json':'text/csv',dialogTitle:'Save or share your Fuel journal'});}finally{if(file.exists)file.delete();}break;}
 }}catch(error){const message=error instanceof Error?error.message:'Fuel could not complete that action.';report({error:message});}}
 function reload(){setFailed(false);setLoading(true);if(source!==HOME)setSource(HOME);else browser.current?.reload();}
 return <SafeAreaView style={styles.screen} edges={['top','bottom']}><StatusBar style="light"/><View style={styles.header}><View><Text style={styles.brand}>fuel<Text style={styles.dot}>.</Text></Text><Text style={styles.version}>ANDROID {INFO.version}</Text></View><Pressable accessibilityLabel="Refresh Fuel" onPress={reload}><Text style={styles.link}>Refresh ↻</Text></Pressable><Pressable accessibilityLabel="Open Fuel in browser" onPress={()=>Linking.openURL(HOME)}><Text style={styles.link}>Browser ↗</Text></Pressable></View><View style={styles.photoBar}><Pressable accessibilityLabel="Take a meal photo" onPress={()=>pick(true)} style={styles.photoButton}><Text style={styles.photoText}>Camera</Text></Pressable><Pressable accessibilityLabel="Choose a meal photo" onPress={()=>pick(false)} style={styles.photoButton}><Text style={styles.photoText}>Photos</Text></Pressable></View>
 {failed?<View style={styles.message}><Text style={styles.title}>Your journal travels with you.</Text><Text style={styles.body}>Reconnect to sync and analyze photos. If you have used Fuel online on this device, its saved offline journal may still be available.</Text><Pressable style={styles.button} onPress={reload}><Text style={styles.buttonText}>Reconnect</Text></Pressable><Pressable style={styles.photoButton} onPress={()=>{setFailed(false);setSource(ORIGIN+'/offline');}}><Text style={styles.photoText}>Open device journal</Text></Pressable><Text style={styles.body}>{status}</Text></View>:<WebView ref={browser} source={{uri:source}} style={styles.web} sharedCookiesEnabled thirdPartyCookiesEnabled javaScriptEnabled domStorageEnabled injectedJavaScriptBeforeContentLoaded={INFO_SCRIPT} onMessage={message} setSupportMultipleWindows={false} allowsBackForwardNavigationGestures
 onNavigationStateChange={state=>{setCanGoBack(state.canGoBack);try{const url=new URL(state.url);path.current=url.pathname;const isJournal=trusted(state.url)&&['/','/offline'].includes(url.pathname);setJournal(isJournal);if(!isJournal)ready.current=false;}catch{setJournal(false);ready.current=false;}}}
 onLoadStart={()=>{setLoading(true);ready.current=false;if(loadTimer.current)clearTimeout(loadTimer.current);loadTimer.current=setTimeout(()=>{setLoading(false);setStatus('Loading is taking longer. Tap Refresh if the page is blank.');},20000);}}
 onLoadEnd={()=>{setLoading(false);if(loadTimer.current)clearTimeout(loadTimer.current);inject(INFO_SCRIPT);deliver();}}
 onError={()=>{setFailed(true);setLoading(false);setStatus('Connection unavailable. Offline capture works after the device journal opens.');}}
 onHttpError={event=>{if(event.nativeEvent.statusCode>=500&&event.nativeEvent.url.split('?')[0]===source.split('?')[0]){setLoading(false);setStatus('Fuel is temporarily unavailable. Refresh or open the device journal.');}}}
 onContentProcessDidTerminate={()=>browser.current?.reload()}
 onShouldStartLoadWithRequest={request=>{if(trusted(request.url)||request.url==='about:blank')return true;if(/^(https:|mailto:|tel:)/i.test(request.url))Linking.openURL(request.url).catch(()=>{});return false;}}/>}
 {loading&&!failed&&<View style={styles.loading} pointerEvents="none"><ActivityIndicator color="#c6f36b"/><Text style={styles.body}>{status}</Text></View>}</SafeAreaView>;
}
export default function App(){return <SafeAreaProvider><Tracker/></SafeAreaProvider>;}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#171b17'},header:{paddingHorizontal:20,height:62,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},brand:{color:'#f4f5ed',fontWeight:'800',fontSize:27},dot:{color:'#c6f36b'},version:{color:'#8fa28a',fontSize:9,letterSpacing:1},link:{color:'#c6f36b',fontSize:12,padding:10},web:{flex:1,backgroundColor:'#141a17'},photoBar:{flexDirection:'row',gap:10,paddingHorizontal:20,paddingBottom:10},photoButton:{flex:1,padding:13,borderRadius:12,backgroundColor:'#2b3b24',alignItems:'center',minHeight:44},photoText:{color:'#d4edb5',fontWeight:'600'},message:{flex:1,padding:28,justifyContent:'center',gap:20},title:{fontSize:28,fontWeight:'700',color:'#f4f5ed'},body:{color:'#b8c0b0',fontSize:14,lineHeight:22},button:{padding:18,borderRadius:16,backgroundColor:'#c6f36b',alignItems:'center'},buttonText:{fontWeight:'700',color:'#171b17'},loading:{position:'absolute',top:119,bottom:0,left:0,right:0,backgroundColor:'#171b17',justifyContent:'center',alignItems:'center',gap:18,padding:25}});
