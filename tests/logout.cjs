const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('../web/node_modules/typescript');
function load(file,globals={}){const context={exports:{},Response,Request,URL,...globals};const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(source,context);return context.exports;}
(async()=>{
 let destination=null,calls=0;
 let cleared=0,nativeCleared=0;const modules=id=>id==='./local-journal'?{clearLocalJournal:async()=>{cleared++;}}:id==='./native'?{clearNativeSession:()=>{nativeCleared++;}}:{};
 const client=load('web/app/logout.ts',{require:modules,fetch:async()=>{calls++;return Response.json({ok:true});},window:{location:{replace:p=>destination=p}}});await client.logOut();assert.equal(destination,'/welcome');assert.equal(calls,1);assert.equal(cleared,1);assert.equal(nativeCleared,1);
 for(const fetch of [async()=>Response.json({ok:false},{status:503}),async()=>Response.json({ok:false}),async()=>{throw Error('offline');}]){destination=null;const client=load('web/app/logout.ts',{fetch,window:{location:{replace:p=>destination=p}}});await assert.rejects(client.logOut());assert.equal(destination,null,'Failed logout must keep the current screen');}
 let signouts=0,scope;
 const route=load('web/app/api/logout/route.ts',{require:()=>({createClient:async()=>({auth:{signOut:async opts=>{signouts++;scope=opts.scope;return{error:null};}}})})});
 const request=origin=>new Request('https://fuel-journal.vercel.app/api/logout',{method:'POST',headers:origin?{origin}:{}});
 for(const origin of ['https://other.example',null]){assert.equal((await route.POST(request(origin))).status,403);}assert.equal(signouts,0,'Cross-origin requests cannot revoke sessions');
 const response=await route.POST(request('https://fuel-journal.vercel.app'));assert.equal(response.status,200);assert.equal(scope,'local','Logging out must preserve sessions on other devices');assert.equal(response.headers.get('Cache-Control'),'no-store');assert.deepEqual(await response.json(),{ok:true});
 const failed=load('web/app/api/logout/route.ts',{require:()=>({createClient:async()=>{throw Error('storage unavailable');}})});assert.equal((await failed.POST(request('https://fuel-journal.vercel.app'))).status,503);
 console.log('Logout checks passed: landing redirect, failure recovery, origin rejection, current-device scope and no-store response.');
})();
