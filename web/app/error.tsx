'use client';
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <main className="privacy-page"><a className="brand" href="/welcome">fuel<span>✳</span></a><h1>Your journal needs a moment.</h1><p>Fuel could not display this page. Saved cloud meals are retained. Retry before clearing app storage or logging out if you have unfinished or unsynced meals.</p><div className="tool-actions"><button className="primary" onClick={reset}>Try again</button><a className="secondary" href="/offline">Open device journal</a><a className="text-btn" href="/welcome">Go to welcome</a></div></main>;
}
