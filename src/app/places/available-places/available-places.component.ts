import { Component, inject, signal } from '@angular/core';
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
export class AvailablePlacesComponent {
  // importo tramite inject() il service HttpClient
  // ottengo però un errore perchè non c'è un provider per questo service, non è disponibile in tutte le app angular
  // o lo importo qui nel componente con la proprietà providers nell'oggetto di configurazione del decorator @component o lo rendo disponibile in tutta l'app, andandolo ad inserire o nell'app.module.ts (e qui non c'è perchè è un progetto standalone) oppure in questo caso nel file src/main.ts
  private httpClient = inject(HttpClient);

  places = signal<Place[] | undefined>(undefined);
}
