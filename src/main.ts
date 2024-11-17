import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';

// per impostare il provider dell'HttpClient per tutta l'app utilizzo la funzione provideHttpClient()
// in questo modo angular sa come iniettare tramite inject() il service HttpClient
bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()],
}).catch((err) => console.error(err));
