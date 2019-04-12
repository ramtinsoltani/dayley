import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
  AuthComponent,
  HomeComponent,
  CountersComponent,
  TodosComponent,
  SettingsComponent
} from '@app/components';

const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', component: HomeComponent },
  { path: 'counters', component: CountersComponent },
  { path: 'todos', component: TodosComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
