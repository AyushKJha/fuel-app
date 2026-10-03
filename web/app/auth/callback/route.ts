import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {createClient} from '../../../lib/supabase/server';
export async function GET(request:Request){
 const url=new URL(request.url),code=url.searchParams.get('code'),jar=await cookies();
 const recovery=jar.get('fuel-password-recovery')?.value==='1'||url.searchParams.get('next')==='reset-password';
 jar.delete('fuel-password-recovery');
 if(code){try{const client=await createClient();const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(recovery?'/reset-password':'/',url.origin));}catch{}}
 return NextResponse.redirect(new URL('/login?confirmation=failed',url.origin));
}
