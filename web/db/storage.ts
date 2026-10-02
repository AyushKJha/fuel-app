import {createClient} from '../lib/supabase/server';
// Bounded adapter keeps the meal API contract while replacing D1 and R2.
export function database(){return {prepare(sql:string){let values:any[]=[];return {
 bind(...args:any[]){values=args;return this;},
 async all(){const client=await createClient();const {data,error}=await client.from('meals').select('id,payload,photo_key').eq('owner',values[0]).order('date',{ascending:false}).order('id',{ascending:false}).limit(10000);if(error)throw error;return {results:data};},
 async first():Promise<any>{const client=await createClient();const query=sql.includes('FROM settings')?client.from('settings').select('payload').eq('owner',values[0]):client.from('meals').select('photo_key').eq('id',values[0]).eq('owner',values[1]);const {data,error}=await query.maybeSingle();if(error)throw error;return data;},
 async run(){const client=await createClient();const result=sql.startsWith('INSERT INTO meals')?await client.from('meals').insert({id:values[0],owner:values[1],date:values[2],payload:values[3],photo_key:values[4]}):await client.from('settings').upsert({owner:values[0],payload:values[1]},{onConflict:'owner'});if(result.error)throw result.error;}
 };}};}
export function bucket(){return {
 async put(key:string,data:ArrayBuffer,options:{httpMetadata:{contentType:string}}){const client=await createClient();const {error}=await client.storage.from('meal-photos').upload(key,data,{contentType:options.httpMetadata.contentType,upsert:false});if(error)throw error;},
 async delete(key:string){const client=await createClient();const {error}=await client.storage.from('meal-photos').remove([key]);if(error)throw error;},
 async get(key:string){const client=await createClient();const {data,error}=await client.storage.from('meal-photos').download(key);if(error)throw error;if(!data)return null;return {body:data,httpMetadata:{contentType:data.type}};}
};}
