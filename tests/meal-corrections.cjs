const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict'),ts=require('../web/node_modules/typescript');
function load(relative,mocks={}){const filename=path.resolve(__dirname,'../web/app',relative),m=new Module(filename,module);m.paths=Module._nodeModulePaths(path.dirname(filename));const base=m.require.bind(m);m.require=id=>id in mocks?mocks[id]:id.startsWith('.')?load(path.relative(path.resolve(__dirname,'../web/app'),path.resolve(path.dirname(filename),id+'.ts')),mocks):base(id);m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);return m.exports;}
(async()=>{
 const analysis=load('analysis.ts'),corrections=load('food-corrections.ts'),nulls={saturatedFat:null,unsaturatedFat:null,sugar:null,sodium:null,vitaminC:null,vitaminD:null,calcium:null,iron:null};
 const paneer={name:'Paneer',portion:'150g',calories:450,protein:36,carbs:6,fat:28,fiber:0,...nulls};
 const bigger=corrections.scaledFood(paneer,200/150);assert.equal(bigger.protein,48);assert.equal(bigger.portion,'200g');
 const values=Object.fromEntries(Object.entries(bigger).map(([k,v])=>[k,v===null?'':String(v)]));values.protein='50';
 const label=corrections.correctedFood(bigger,values,'200g',false);assert.equal(label.protein,50);assert.equal(analysis.totalFoods([label]).protein,50);
 values.protein='25';values.calories='300';values.carbs='4';values.fat='20';values.fiber='0';
 const per100=corrections.correctedFood(paneer,values,'200g',true);assert.equal(per100.protein,50);assert.equal(per100.calories,600);assert.equal(per100.vitaminC,null);assert.equal(corrections.correctedFood(paneer,values,'0.2kg',true).protein,50);assert.equal(corrections.measuredPortion('0.5L').amount,500);
 assert.throws(()=>corrections.correctedFood(paneer,values,'1 bowl',true));
 assert.throws(()=>corrections.correctedFood(paneer,{...values,protein:'-1'},'200g',false));
 assert.equal(corrections.keepCorrections([{...paneer,protein:36}],[label],[1],[0])[0].protein,50);
 assert.equal(analysis.totalFoods(corrections.keepCorrections([paneer],[label],[.5],[0])).protein,25);
 const payload=analysis.textAnalysisRequest('200g paneer, 150g cooked rice','label: 25g protein per 100g','Maintain');assert(payload.input.every(item=>item.type==='text'));assert(payload.input[0].text.includes('200g paneer'));assert(payload.system_instruction.includes('No image is provided'));
 let signedIn=false,requests=0;const api=load('api/analyze/route.ts',{'../../chatgpt-auth':{getChatGPTUser:async()=>signedIn?{userId:'test'}:null}});process.env.GEMINI_API_KEY='test-placeholder-not-a-real-key';global.fetch=async(_url,opts)=>{requests++;const body=JSON.parse(opts.body);assert(body.input.every(item=>item.type==='text'));return Response.json({output_text:JSON.stringify({isFood:true,name:'Paneer',uncertainty:'Typical food estimate',suggestion:'Check label',foods:[label]})});};
 function req(description,origin='https://fuel-journal.vercel.app'){const form=new FormData();if(description!==undefined)form.set('description',description);return new Request('https://fuel-journal.vercel.app/api/analyze',{method:'POST',headers:{origin},body:form});}
 assert.equal((await api.POST(req('200g paneer'))).status,401);assert.equal(requests,0);signedIn=true;assert.equal((await api.POST(req('200g paneer','https://evil.test'))).status,403);assert.equal((await api.POST(req(''))).status,400);assert.equal((await api.POST(req('x'.repeat(3001)))).status,400);assert.equal(requests,0);const response=await api.POST(req('200g paneer'));assert.equal(response.status,200);assert.equal((await response.json()).estimate.protein,50);assert.equal(requests,1);
 console.log('PASS: 150→200g exact scaling, 50g protein override, per-100g conversion, correction preservation, unknown nutrients and protected text-only estimation. Provider mocked.');
})().catch(error=>{console.error(error);process.exitCode=1;});
