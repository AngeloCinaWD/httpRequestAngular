import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { map } from 'rxjs';

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

  ngOnInit(): void {
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

    const getPlaces = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places')
      // posso utilizzare il map per restituire direttamente i places, dato che ricevo il body avrei un oggetto con all'interno una proprietà places
      // il valore emesso dall'observable Http è uno solo, quindi il map agisce una sola volta
      .pipe(map((body) => body.places))
      .subscribe({
        next: (places) => {
          // assegno i dati al mio signal, utilizzando il map prima non ho bisogno di fare response.places perchè ho già l'array di Place, cioè il value della key places contenuta nel body
          // il mio signal places è ora un array di Place
          this.places.set(places);
        },
        complete: () => console.log('complete'),
      });

    this.destroyRef.onDestroy(() => {
      getPlaces.unsubscribe();
    });
  }
}
