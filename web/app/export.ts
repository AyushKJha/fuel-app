import {Meal,Goals,nutrientKeys} from './model';
import {nativeMessage} from './native';
function cell(value:unknown){let text=String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
export function journalExport(meals:Meal[],goals:Goals,format:'json'|'csv'){
 const rows=meals.filter(m=>!m.demo);
 if(format==='json')return JSON.stringify({format:'fuel-journal-v1',exportedAt:new Date().toISOString(),goals,meals:rows.map(({photo,...meal})=>meal),notes:'Photos are excluded. Pending meals are marked pending.'},null,2);
 const fields=['id','date','time','category','name',...nutrientKeys,'notes','pending'] as const;
 return [fields.map(cell).join(','),...rows.map(row=>fields.map(field=>cell(row[field])).join(','))].join('\r\n');
}
export async function exportJournal(meals:Meal[],goals:Goals,format:'json'|'csv'){
 const text=journalExport(meals,goals,format),filename='fuel-journal-'+new Date().toISOString().slice(0,10)+'.'+format;
 if(nativeMessage({type:'fuel-export',text,filename,format}))return;
 const url=URL.createObjectURL(new Blob([text],{type:format==='json'?'application/json':'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
