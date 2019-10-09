import {Action} from '@ngrx/store';
import {TextArea} from '../textarea/shared/models/textarea.model';


export const ADD_TEXTAREA = '[TEXTAREA] ADD';

export class AddTextArea implements Action {
  readonly type = ADD_TEXTAREA;

  constructor(public payload: TextArea) {
  }
}

export type Actions = AddTextArea;
