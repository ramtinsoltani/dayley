import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
  AuthComponent,
  StatsComponent,
  CountersComponent,
  TodosComponent,
  GoalsComponent,
  SettingsComponent
} from '@app/components';

const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', component: StatsComponent },
  { path: 'counters', component: CountersComponent },
  { path: 'todos', component: TodosComponent },
  { path: 'goals', component: GoalsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
