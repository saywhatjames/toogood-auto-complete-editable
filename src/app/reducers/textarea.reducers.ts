import {TextArea} from '../textarea/shared/models/textarea.model';
import * as TextAreaActions from '../actions/textarea.actions';

const initialState: TextArea = {
  text: ''
};

export function TextAreaReducer(state: TextArea = initialState, action: TextAreaActions.AddTextArea) {
  switch (action.type) {
    case TextAreaActions.ADD_TEXTAREA:
      return action.payload;
    default:
      return state;
  }

}

