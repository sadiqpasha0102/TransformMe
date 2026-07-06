import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'signup',
        pathMatch: 'full'
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'home',
        loadComponent: () =>
            loadRemoteModule({
                remoteName: 'home',
                exposedModule: './Component',
            })
                .then(m => m.AppComponent)
    }
];
