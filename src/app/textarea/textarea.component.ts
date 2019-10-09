import {Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {TextareaService} from './shared/textarea.service';
import {Store} from '@ngrx/store';
import {AppState} from '../app.state';
import * as TextAreaActions from '../actions/textarea.actions';


// imports for reading ngrx store uncomment
import {TextArea} from './shared/models/textarea.model';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextareaComponent implements OnInit {

  // declare initial text as empty for IE
  suggestions = [];
  text = {innerHtml: '', innerText: ''};

  // for ngrx check
  textArea$: Observable<TextArea>;

  /**
   * The title of the text area
   */
  @Input() title = 'Note Content';

  /**
   * The title of the text area
   */
  @Input() placeholder = 'Type Here...';


  @ViewChild('textarea', {static: false}) textarea: HTMLElement;

  constructor(private tas: TextareaService,
              private el: ElementRef,
              private store: Store<AppState>) {
  }

  /**
   * A function that watches for input changes
   * and store changes to redux store
   */
  onInputChange(text) {
    // redux store input
    this.store.dispatch(new TextAreaActions.AddTextArea({text: text.innerText}));

    // showing contents of redux store
    this.textArea$ = this.store.select('textarea');
  }


  /**
   * Initialize component and subscribe to observable that returns names
   */
  ngOnInit() {
    this.tas.getSuggestions().subscribe((suggestions: Array<string>) => {
        this.suggestions = suggestions;
      }
    );
  }

}
