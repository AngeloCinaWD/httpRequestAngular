import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';

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
    const getPlaces = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places')
      .subscribe({
        next: (data) => console.log(data.places),
        complete: () => console.log('complete'),
      });

    this.destroyRef.onDestroy(() => {
      getPlaces.unsubscribe();
    });
  }
}
