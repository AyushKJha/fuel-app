import {createClient} from '../../../lib/supabase/server';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 try{
  const client=await createClient();
  const {error}=await client.auth.signOut({scope:'local'});
  return Response.json({ok:!error},{status:error?503:200,headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({ok:false,error:'Could not log out. Please try again.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
