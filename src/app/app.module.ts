import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faSpinner,
  faExclamation,
  faCog,
  faHome,
  faCalculator,
  faCheck,
  faChevronLeft,
  faPen,
  faPlus,
  faUser
} from '@fortawesome/free-solid-svg-icons';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfirmPasswordDirective } from '@app/directive/confirm-password';
import { EmailDirective } from '@app/directive/email';
import {
  AuthComponent,
  HeaderComponent,
  FooterComponent,
  HomeComponent,
  CountersComponent,
  TodosComponent,
  SettingsComponent
} from '@app/components';

library.add(
  faSpinner,
  faExclamation,
  faCog,
  faHome,
  faCalculator,
  faCheck,
  faChevronLeft,
  faPen,
  faPlus,
  faUser
);

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    AuthComponent,
    HomeComponent,
    CountersComponent,
    TodosComponent,
    SettingsComponent,
    ConfirmPasswordDirective,
    EmailDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
