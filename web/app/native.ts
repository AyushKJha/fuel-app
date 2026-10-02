export type NativeInfo={version:string;versionCode:number;notifications:boolean;sharing:boolean};
type NativeWindow=Window&{ReactNativeWebView?:{postMessage:(message:string)=>void};__fuelNative?:NativeInfo};
export function nativeMessage(message:Record<string,unknown>){const bridge=(window as NativeWindow).ReactNativeWebView;if(!bridge)return false;bridge.postMessage(JSON.stringify(message));return true;}
export function nativeInfo(){return (window as NativeWindow).__fuelNative;}
export function clearNativeSession(){
 // Queue a disabled config behind any in-flight scheduling before clearing the native session.
 nativeMessage({type:'fuel-reminder',owner:'logout',date:new Date().toISOString().slice(0,10),enabled:false,time:'21:00',totals:{calories:0,protein:0,carbs:0,fat:0,fiber:0}});
 nativeMessage({type:'fuel-logout'});
}
