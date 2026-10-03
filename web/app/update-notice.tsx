'use client';
import {useEffect,useState} from 'react';
import {nativeInfo,nativeMessage,NativeInfo} from './native';
export function UpdateNotice(){
 const [info,setInfo]=useState<NativeInfo|undefined>(),[release,setRelease]=useState<{version:string;versionCode:number;url:string}|null>(null);
 useEffect(()=>{const refresh=()=>setInfo(nativeInfo());refresh();window.addEventListener('fuel-native-ready',refresh);nativeMessage({type:'fuel-request-info'});fetch('/android-release.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(value=>{if(value&&Number.isInteger(value.versionCode)&&typeof value.url==='string'&&value.url.startsWith('https://expo.dev/artifacts/eas/')&&value.url.endsWith('.apk'))setRelease(value);}).catch(()=>{});return()=>window.removeEventListener('fuel-native-ready',refresh);},[]);
 if(!info||!release||info.versionCode>=release.versionCode)return null;
 return <div className="notice update-notice" role="status"><strong>Fuel {release.version} is ready.</strong><p>Update for barcode scanning and clearer photo feedback. Install over Fuel to retain your account; Android asks you to confirm.</p><a className="primary" href={release.url} onClick={e=>{if(nativeMessage({type:'fuel-update',url:release.url}))e.preventDefault();}}>Update Android app</a></div>;
}
