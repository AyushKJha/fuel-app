export async function logOut():Promise<void>{
 const response=await fetch('/api/logout',{method:'POST',credentials:'same-origin',cache:'no-store'});
 if(!response.ok)throw new Error('Could not log out. Please try again.');
 const result=await response.json();
 if(result.ok!==true)throw new Error('Could not log out. Please try again.');
 // Clear local copies before moving away from the authenticated journal.
 const {clearLocalJournal}=await import('./local-journal');
 try{await clearLocalJournal();}catch{ /* The active local identity is cleared even if IndexedDB cleanup fails. */ }
 const {clearNativeSession}=await import('./native');clearNativeSession();
 window.location.replace('/welcome');
}
