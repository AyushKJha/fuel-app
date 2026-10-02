import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export async function createClient(){
 const jar=await cookies();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new Error('Account storage is not configured');
 return createServerClient(url,key,{cookies:{getAll:()=>jar.getAll(),setAll(items){try{items.forEach(({name,value,options})=>jar.set(name,value,options));}catch{ /* Proxy refreshes Server Component sessions. */ }}}});
}
