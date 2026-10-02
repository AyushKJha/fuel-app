import {redirect} from 'next/navigation';
import FuelApp from './fuel-app';
import {getChatGPTUser} from './chatgpt-auth';
export default async function Page(){const user=await getChatGPTUser();if(!user)redirect('/login');return <FuelApp owner={user.userId}/>;}
