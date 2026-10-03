import {getChatGPTUser} from '../../chatgpt-auth';
import {analysisRequest,parseAnalysis} from '../../analysis';
export const maxDuration=60;
export async function POST(req:Request){
 const user=await getChatGPTUser();
 if(!user)return Response.json({error:'Sign in to analyze a meal.'},{status:401});
 const origin=req.headers.get('origin');
 if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 const key=process.env.GEMINI_API_KEY;
 if(!key)return Response.json({error:'Photo analysis is being connected. Please try again shortly.'},{status:503});
 try{
  const body=await req.formData(),photo=body.get('photo');
  if(!(photo instanceof File)||!photo.size||photo.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(photo.type))return Response.json({error:'Choose a JPG, PNG or WebP photo under 5 MB.'},{status:400});
  const context=String(body.get('context')||'').slice(0,3000);
  const goal=['Lean bulk','Cut','Maintain'].includes(String(body.get('goal')))?String(body.get('goal')):'Maintain';
  const options={method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},signal:AbortSignal.timeout(55000),body:JSON.stringify(analysisRequest(new Uint8Array(await photo.arrayBuffer()),photo.type,context,goal))};
  let r=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',options);
  if(r.status===503){await r.arrayBuffer();r=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',options);}
  if(!r.ok){console.error('Meal analysis provider failure',{status:r.status});return Response.json({error:r.status===429?'The free photo-analysis allowance is temporarily used up. Try again later; your photo is still here.':r.status===401||r.status===403?'Photo analysis could not connect. Please try again shortly.':'Photo analysis is temporarily unavailable. Please retry.'},{status:r.status===429?429:503});}
  const estimate=parseAnalysis(await r.json());
  if(!estimate.isFood)return Response.json({error:estimate.uncertainty||'No meal could be identified. Try a clearer photo.'},{status:422});
  return Response.json({estimate,provider:'Gemini'},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Meal analysis did not finish',{name:e instanceof Error?e.name:'Unknown'});return Response.json({error:'The estimate could not be verified. Try a clearer photo or add measured portion details and retry.'},{status:503});}
}
