import {createClient} from '../lib/supabase/server';
export async function getChatGPTUser(){try{const client=await createClient();const {data:{user},error}=await client.auth.getUser();if(error||!user)return null;return {userId:user.id,displayName:user.email||'Your space',email:user.email||'',fullName:null};}catch{return null;}}
