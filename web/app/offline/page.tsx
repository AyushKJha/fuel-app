'use client';
import {useEffect,useState} from 'react';
import FuelApp from '../fuel-app';
import {rememberedOwner} from '../local-journal';
export default function Offline(){const [owner,setOwner]=useState<string|null>(null),[ready,setReady]=useState(false);useEffect(()=>{setOwner(rememberedOwner());setReady(true);},[]);return owner?<FuelApp owner={owner}/>:<main className="login-page"><div className="card login-card"><h1>{ready?'Your device journal is empty':'Opening your device journal…'}</h1><p>Sign in online once to save a private journal on this device. It is cleared when you log out.</p><a className="primary" href="/">Reconnect</a></div></main>;}
