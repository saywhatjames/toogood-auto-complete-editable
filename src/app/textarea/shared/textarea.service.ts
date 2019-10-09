import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {NAMES} from './mock.users';


@Injectable({
  providedIn: 'root'
})
export class TextareaService {
  suggestions$: Observable<[any]>;


  constructor() {
  }

  getSuggestions(): Observable<[any]> {
    return this.suggestions$ = Observable.create((observer) =>
      observer.next(NAMES));
  }
}
