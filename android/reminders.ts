import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
export type ReminderConfig={owner:string;date:string;enabled:boolean;time:string;totals:{calories:number;protein:number;carbs:number;fat:number;fiber:number}};
const key='fuel-reminder-v3',channel='fuel-evening';let last='',chain=Promise.resolve();
Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:false,shouldSetBadge:false})});
export async function notificationPermission(){await Notifications.setNotificationChannelAsync(channel,{name:'Evening meal summary',importance:Notifications.AndroidImportance.DEFAULT,sound:null,lockscreenVisibility:Notifications.AndroidNotificationVisibility.PRIVATE});let permission=await Notifications.getPermissionsAsync();if(!permission.granted)permission=await Notifications.requestPermissionsAsync();return permission.granted;}
async function cancel(){for(const notification of await Notifications.getAllScheduledNotificationsAsync()){if(notification.content.data?.fuel===true)await Notifications.cancelScheduledNotificationAsync(notification.identifier);}}
export async function clearReminders(){await cancel();await Notifications.dismissAllNotificationsAsync();await SecureStore.deleteItemAsync(key);last='';}
export async function restoreReminders(){const saved=await SecureStore.getItemAsync(key);if(saved){try{await updateReminders(JSON.parse(saved));}catch{await SecureStore.deleteItemAsync(key);}}}
export function updateReminders(config:ReminderConfig){const run=chain.then(async()=>{
 if(typeof config.owner!=='string'||config.owner.length>100||typeof config.enabled!=='boolean'||!/^\d{4}-\d{2}-\d{2}$/.test(config.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(config.time)||!config.totals||Object.values(config.totals).some(value=>!Number.isFinite(value)||value<0||value>100000))throw Error('Reminder settings were not valid.');
 const serialized=JSON.stringify(config);if(serialized===last)return;
 if(!config.enabled){await clearReminders();return;}
 if(!await notificationPermission())throw Error('Allow notifications in Android Settings to receive evening summaries.');
 await cancel();const now=new Date(),[hour,minute]=config.time.split(':').map(Number),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 // Today uses known totals only. Future days never repeat stale macros.
 for(let day=0;day<30;day++){const at=new Date(now);at.setDate(now.getDate()+day);at.setHours(hour,minute,0,0);if(at<=now)continue;const known=day===0&&config.date===today,totals=config.totals;await Notifications.scheduleNotificationAsync({identifier:'fuel-evening-'+day,content:{title:known?'Your recorded day in Fuel':'Your evening Fuel check-in',body:known?`${Math.round(totals.calories)} kcal · ${Math.round(totals.protein)}g protein · ${Math.round(totals.carbs)}g carbs · ${Math.round(totals.fat)}g fat · ${Math.round(totals.fiber)}g fibre. Open your full summary.`:'Open Fuel to review today’s meals and nutrition. Totals refresh when your journal opens.',data:{fuel:true,summary:true},sound:false},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:at,channelId:channel}});}
 await SecureStore.setItemAsync(key,serialized);last=serialized;
 });chain=run.catch(()=>{});return run;
}
