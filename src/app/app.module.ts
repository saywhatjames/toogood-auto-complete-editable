import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {StoreModule} from '@ngrx/store';
import {TextAreaReducer} from './reducers/textarea.reducers';
import {AppComponent} from './app.component';
import {TextareaComponent} from './textarea/textarea.component';
import {HeaderComponent} from './header/header.component';
import {SuggestionsComponent} from './suggestions/suggestions.component';

import {SuggestionsDirective} from './suggestions/suggestions.directive';


@NgModule({
  declarations: [
    AppComponent,
    TextareaComponent,
    HeaderComponent,
    SuggestionsComponent,
    SuggestionsDirective
  ],
  imports: [
    BrowserModule,
    OverlayModule,
    BrowserAnimationsModule,
    StoreModule.forRoot(
      {textarea: TextAreaReducer},
      {
        runtimeChecks: {
          strictStateImmutability: true,
          strictActionImmutability: true
        }
      })
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [SuggestionsComponent],
})
export class AppModule {
}
