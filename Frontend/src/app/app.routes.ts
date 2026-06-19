import { Routes } from '@angular/router';
import { Register } from './Components/register/register';
import { Home } from './Components/home/home';
import { Login } from './Components/login/login';
import { AddCommunity } from './Components/add-community/add-community';

export const routes: Routes = [
    {path:"register",component:Register},
    {path:"",component:Home},
    {path:"login",component:Login},
    {path:"addCommunity",component:AddCommunity},
];
