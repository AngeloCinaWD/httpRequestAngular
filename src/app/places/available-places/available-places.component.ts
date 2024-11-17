import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  // importo tramite inject() il service HttpClient
  // ottengo però un errore perchè non c'è un provider per questo service, non è disponibile in tutte le app angular
  // o lo importo qui nel componente con la proprietà providers nell'oggetto di configurazione del decorator @component o lo rendo disponibile in tutta l'app, andandolo ad inserire o nell'app.module.ts (e qui non c'è perchè è un progetto standalone) oppure in questo caso nel file src/main.ts
  private httpClient = inject(HttpClient);

  // inietto il DestroyRef per annullare le sottoscrizioni
  private destroyRef = inject(DestroyRef);

  places = signal<Place[] | undefined>(undefined);
  // creo un nuovo signal per gestire la fase di caricamento dati, un booleano, ad esempio per mostrare uno spinner di caricamento
  isFetching = signal<boolean>(false);
  // creo un signal per getsire gli errori che possono capitare ad esempio perchè manca internet o perchè c'è un problema nel BE
  error = signal<string>('');

  ngOnInit(): void {
    // setto il valore di isFetching a true, prima di effettuare il fetch dei dati tramite request Http
    this.isFetching.set(true);

    // recupero i places, mi arriverà un oggetto con una key places con value un array di Place
    // in genere gli observables prodotti dall'HttpClient emettono un solo valore, hanno quindi anche un complete event e non sarebbe necessario annullare la sottoscrizione
    // i dati arrivano con un po' di ritardo perchè è stato settato un ritardo nella risposta di 3 secondi nel backend implementato con nodeJs
    // è possibile passare dei parametri di configurazione della request aggiungendo un oggetto con delle proprietà (senza parametri di configurazione mi arriva direttamente il body)
    // se invio la request senza passare nulla ottengo i dati e basta, se per esempio passo la proprietà observe: 'response' ottengo tutta la response, che di solito contiene un body, un oggetto con i dati al suo interno, l'headers, lo status, l'ok etc etc

    // const getPlaces = this.httpClient
    //   .get<{ places: Place[] }>('http://localhost:3000/places')
    //   .subscribe({
    //     next: (data) => console.log(data.places),
    //     complete: () => console.log('complete'),
    //   });

    // in caso la response non contenga un body, ma vogliamo utilizzarlo, mettiamo il ? dopo body: response.body?.places
    // cioè se body esiste prendimi places, altrimenti mi si bloccherebbe il codice perchè prova a chiamare una property di un oggetto che non esiste

    // const getPlaces = this.httpClient
    //   .get<{ places: Place[] }>('http://localhost:3000/places', {
    //     observe: 'response',
    //   })
    //   .subscribe({
    //     next: (response) => {
    //       console.log(response);
    //       console.log(response.body?.places);
    //     },
    //     complete: () => console.log('complete'),
    //   });

    // settando la proprietà observe su events, la risposta mi arriverà più volte, a seconda del ciclo di vita della request
    // const getPlaces = this.httpClient
    //   .get<{ places: Place[] }>('http://localhost:3000/places', {
    //     observe: 'events',
    //   })
    //   .subscribe({
    //     next: (events) => {
    //       console.log(events);
    //     },
    //     complete: () => console.log('complete'),
    //   });

    // si potrebbero verificare errori nel backend e vanno gestiti, ad esempio ricevo una risposta dal backend con uno status 500
    // utilizzo l'error property del subscribe che mi intercetta un eventuale errore durante la request http
    const getPlaces = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places')
      // posso utilizzare il map per restituire direttamente i places, dato che ricevo il body avrei un oggetto con all'interno una proprietà places
      // il valore emesso dall'observable Http è uno solo, quindi il map agisce una sola volta
      // per gestire gli errori posso utilizzare l'operator catchError() che ha come argomento l'errore intercettato
      // l'errore però deve essere restituito come observable, catchError non restituisce un observable, utilizzo la funzione rxjs throwError() in modo che la error property del subscriber venga attivata
      // in throwError istanzio una classe js Error
      // facendo in questo modo posso bloccare qualsiasi errore e mettere un messaggio di errore per tutti i tipi ed assegnare il tipo Error all'error argument della callback function della error property
      .pipe(
        map((body: { places: Place[] }) => body.places),
        catchError((error) => throwError(() => new Error('erroreeee')))
      )
      .subscribe({
        next: (places: Place[]) => {
          // assegno i dati al mio signal, utilizzando il map prima non ho bisogno di fare response.places perchè ho già l'array di Place, cioè il value della key places contenuta nel body
          // il mio signal places è ora un array di Place
          this.places.set(places);
        },
        // il complete mi trona utile per settare il valore di isFetching a false perchè ho terminato il fetching dei dati
        //  perchè sono sicuro che verrà eseguito una volta che la request è stata completata
        complete: () => this.isFetching.set(false),
        // setto il signal error con il valore tornato dall'error property
        // error: (error: HttpErrorResponse) => this.error.set(error.statusText),
        error: (error: Error) => this.error.set(error.message),
      });

    this.destroyRef.onDestroy(() => {
      getPlaces.unsubscribe();
    });
  }
}
