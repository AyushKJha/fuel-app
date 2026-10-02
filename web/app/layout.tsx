import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Fuel — Your meal & macro journal',description:'Capture your meals, track your macros and see your progress.',icons:{icon:'/favicon.svg'},manifest:'/manifest.webmanifest'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
