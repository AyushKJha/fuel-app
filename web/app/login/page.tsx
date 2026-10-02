import {redirect} from 'next/navigation';
import {getChatGPTUser} from '../chatgpt-auth';
import LoginForm from './login-form';
export default async function LoginPage(){if(await getChatGPTUser())redirect('/welcome');return <LoginForm/>;}
