type NativePhoto={requestId?:string;base64?:string;canceled?:boolean;error?:string};
type FuelWindow=Window&{ReactNativeWebView?:{postMessage:(message:string)=>void};__fuelHandleNativePhoto?:(result:NativePhoto)=>void;__fuelReceivePhoto?:(base64:string)=>void};
export function photoFile(base64:string){
 if(!base64||base64.length>7*1024*1024)throw new Error('Choose a smaller photo.');
 const raw=atob(base64),bytes=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 if(bytes.length<3||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw new Error('This photo could not be opened. Please try another image.');
 return new File([bytes],'meal.jpg',{type:'image/jpeg'});
}
export function installPhotoReceiver(onFile:(file:File)=>void,onError:(message:string)=>void){
 const target=window as FuelWindow;
 const seen=new Set<string>();
 const receive=(result:NativePhoto)=>{
  if(result.requestId&&seen.has(result.requestId)){target.ReactNativeWebView?.postMessage(JSON.stringify({type:'fuel-photo-ack',requestId:result.requestId}));return;}
  try{if(result.error)onError(result.error);else if(!result.canceled&&result.base64)onFile(photoFile(result.base64));}
  catch(e){onError(e instanceof Error?e.message:'Photo could not be opened.');}
  finally{if(result.requestId){seen.add(result.requestId);target.ReactNativeWebView?.postMessage(JSON.stringify({type:'fuel-photo-ack',requestId:result.requestId}));}}
 };
 const legacy=(base64:string)=>receive({base64});
 target.__fuelHandleNativePhoto=receive;target.__fuelReceivePhoto=legacy;
 target.ReactNativeWebView?.postMessage(JSON.stringify({type:'fuel-photo-ready'}));
 return ()=>{if(target.__fuelHandleNativePhoto===receive)delete target.__fuelHandleNativePhoto;if(target.__fuelReceivePhoto===legacy)delete target.__fuelReceivePhoto;};
}
export function requestPhoto(camera:boolean){
 const target=window as FuelWindow;
 if(!target.ReactNativeWebView)return false;
 // Reassert the adapter for old APKs whose injected script may run after React mounts.
 target.__fuelReceivePhoto=(base64:string)=>target.__fuelHandleNativePhoto?.({base64});
 target.ReactNativeWebView.postMessage(JSON.stringify({type:'fuel-photo-ready'}));
 target.ReactNativeWebView.postMessage(JSON.stringify({type:'fuel-photo',camera,requestId:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}));
 return true;
}
