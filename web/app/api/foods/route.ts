import {getChatGPTUser} from '../../chatgpt-auth';
import {parseLabelProduct} from '../../food-label';
export async function GET(request:Request){
 if(!await getChatGPTUser())return Response.json({error:'Sign in to look up a food label.'},{status:401});
 const code=new URL(request.url).searchParams.get('barcode')||'';
 if(!/^\d{8,14}$/.test(code))return Response.json({error:'Enter the 8–14 digits printed below the barcode.'},{status:400});
 try{
  const response=await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=code,product_name,product_name_en,nutriments,nutrition_data_per`,{headers:{'User-Agent':'Fuel/0.4 (https://fuel-journal.vercel.app)'},signal:AbortSignal.timeout(10000),next:{revalidate:3600}});
  if(!response.ok)throw Error('Food lookup is temporarily unavailable. Use the package label or retry.');
  const data=await response.json();if(data.status!==1)return Response.json({error:'Product not found. Photograph its nutrition label or enter the label values.'},{status:404});
  return Response.json({product:parseLabelProduct(code,data.product)},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){return Response.json({error:error instanceof Error?error.message:'Food lookup failed. Please retry.'},{status:503});}
}
