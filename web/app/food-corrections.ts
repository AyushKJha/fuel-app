import {EstimatedFood,foodSchema,totalFoods} from './analysis';
import {nutrientKeys} from './model';
export function measuredPortion(portion:string){
 const match=portion.match(/^\s*(\d+(?:\.\d+)?)\s*(g|grams?|kg|ml|millilit(?:er|re)s?|l)\b/i);
 if(!match||Number(match[1])<=0)return null;
 const raw=match[2].toLowerCase(),unit=raw==='kg'||raw==='g'||raw.startsWith('gram')?'g':'ml';
 return {amount:Number(match[1])*(raw==='kg'||raw==='l'?1000:1),unit,suffix:portion.slice(match[0].length).trim()};
}
export function scaledFood(food:EstimatedFood,scale:number,portion?:string):EstimatedFood{
 if(!Number.isFinite(scale)||scale<0||scale>10000)throw Error('Enter a valid portion.');
 const measured=measuredPortion(food.portion);
 portion??=scale===1?food.portion:measured?`${Math.round(measured.amount*scale*100)/100}${measured.unit}${measured.suffix?' '+measured.suffix:''}`:`${food.portion} × ${scale}`;
 return foodSchema.parse({...food,portion,...totalFoods([food],[scale])});
}
export function correctedFood(food:EstimatedFood,values:Record<string,string>,portion:string,per100:boolean):EstimatedFood{
 const measured=measuredPortion(portion);
 if(per100&&(!measured||!['g','ml'].includes(measured.unit)))throw Error('Per 100 values need a portion in grams or millilitres.');
 const scale=per100?measured!.amount/100:1;
 return foodSchema.parse({...food,portion,...Object.fromEntries(nutrientKeys.map((key,index)=>[key,values[key]===''?(index<5?NaN:null):Math.round(Number(values[key])*scale*10)/10]))});
}
// A user's applied label values take priority over a subsequent AI pass for extras.
export function keepCorrections(estimated:EstimatedFood[],previous:EstimatedFood[],scales:number[],indices:number[]){
 const corrected=indices.filter(i=>previous[i]&&(scales[i]??1)>0).map(i=>scaledFood(previous[i],scales[i]??1));
 const result=[...estimated];
 for(const food of corrected){const name=food.name.trim().toLowerCase();const index=result.findIndex(row=>row.name.trim().toLowerCase()===name);if(index<0)result.push(food);else result[index]=food;}
 return result;
}
