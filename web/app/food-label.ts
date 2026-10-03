import {Meal,mealSchema,dateKey,nutrientKeys} from './model';
export type LabelProduct={code:string;name:string;basis:'g'|'ml';nutrients:Record<string,number|null>;url:string};
export function parseLabelProduct(code:string,product:any):LabelProduct{
 const raw=product?.nutriments||{},nutrients:Record<string,number|null>={};
 const names:Record<string,string>={calories:'energy-kcal',protein:'proteins',carbs:'carbohydrates',fat:'fat',fiber:'fiber',saturatedFat:'saturated-fat',sugar:'sugars',sodium:'sodium',vitaminC:'vitamin-c',vitaminD:'vitamin-d',calcium:'calcium',iron:'iron'};
 for(const key of nutrientKeys){const value=raw[names[key]+'_100g'];const n=typeof value==='number'?value:null;nutrients[key]=n!==null&&Number.isFinite(n)&&n>=0?n*(key==='vitaminD'?1000000:['sodium','vitaminC','calcium','iron'].includes(key)?1000:1):null;}
 if(['calories','protein','carbs','fat'].some(k=>nutrients[k]===null))throw Error('This product has incomplete nutrition. Enter the missing values from its label.');
 // A missing fibre value remains unknown until explicitly entered by the user.
 return {code,name:String(product.product_name||product.product_name_en||'Packaged food').slice(0,120),basis:product.nutrition_data_per==='100ml'?'ml':'g',nutrients,url:'https://world.openfoodfacts.org/product/'+code};
}
export function labelMeal(product:LabelProduct,amount:number,fiber:number):Meal{
 if(!Number.isFinite(amount)||amount<=0||amount>2000)throw Error('Enter a serving between 0 and 2,000 '+product.basis+'.');
 const values=Object.fromEntries(nutrientKeys.map(k=>[k,product.nutrients[k]===null?null:Math.round(product.nutrients[k]!*amount/100*10)/10]));
 values.fiber=product.nutrients.fiber===null?fiber:values.fiber;
 return {...mealSchema.parse({name:product.name,date:dateKey(),time:new Date().toTimeString().slice(0,5),category:'Snack',notes:`Label lookup: ${product.code}; ${amount}${product.basis}. Open Food Facts community data; review against package.`,...values}),id:crypto.randomUUID()};
}
