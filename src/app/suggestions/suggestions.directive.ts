import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive, ElementRef,
  EventEmitter,
  HostListener, Injector,
  Input, OnDestroy,
  Output,
  ViewContainerRef
} from '@angular/core';
import {SuggestionsComponent} from './suggestions.component';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[appSuggestions]',
})
export class SuggestionsDirective implements OnDestroy {

  /**
   * The character that will trigger the menu to appear
   */
  @Input() triggerCharacter = '@';

  /**
   * The regular expression that will match the search text after the trigger character
   */
  @Input() searchRegexp = /^\w*$/;

  /**
   * An array of objects for the accepted suggestions.
   */
  @Input() suggestions: any[];

  /**
   * Input to toggle focusing on tag if clicked
   * default to true
   */
  @Input() tagFocus = true;

  /**
   * The number of suggestions shown in the menu
   * 5 if not set.
   */
  @Input() suggestionCount = 5;

  /**
   * The suggestions component to show available suggestions.
   */
  @Input() suggestionsComponent = SuggestionsComponent;

  /**
   * Called when the suggestions menu is shown
   */
  @Output() menuShown = new EventEmitter();

  /**
   * Called when the suggestions menu is hidden
   */
  @Output() menuHidden = new EventEmitter();

  /**
   * Called when a choice is selected
   */
  @Output() choiceSelected = new EventEmitter();

  /**
   * A function that accepts a search string and returns an array of choices. Can also return a promise.
   */
  @Input() findChoices: (searchText: string) => any[] | Subject<any[]>;

  private idCount = 0;

  private menu:
    | {
    component: ComponentRef<SuggestionsComponent>;
    triggerCharacterPosition: number;
    lastCaretPosition?: number;
  }
    | undefined;

  private menuHidden$ = new Subject();

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private viewContainerRef: ViewContainerRef,
              private injector: Injector,
              private el: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === this.triggerCharacter) {
      this.showMenu();
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      this.deleteSuggestion();
    }
  }

  @HostListener('click', ['$event'])
  onClick(e) {
    if (this.tagFocus) {
      if (e.target && e.target.id.indexOf('span') >= 0) {
        this.elFocus(e.target);
      }
    }
  }

  @HostListener('blur')
  onBlur() {
    if (this.menu) {
      this.menu.lastCaretPosition = this.getCaretPosition().innerHTML;
    }
  }

  /**
   * A function that focuses on the element when caret is active in the area
   */

  elFocus(e) {
    const el = this.el.nativeElement;
    const doc = el.ownerDocument;
    const win = doc.defaultView || doc.parentWindow;
    const selection = win.getSelection();
    const range = selection.getRangeAt(0);

    console.log(e.firstChild);
    range.setStart(e, 0);
    range.setEnd(e, 1);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * A function that return the caret position of the innertext and position
   * of the caret in terms of inner HTML
   */

  getCaretPosition(): any {
    const el = this.el.nativeElement;
    const doc = el.ownerDocument;
    const win = doc.defaultView || doc.parentWindow;
    let sel = win.getSelection();
    const range = sel.getRangeAt(0);
    let start = 0;
    let end = 0;

    if (typeof win.getSelection !== 'undefined') {
      if (sel.rangeCount > 0) {
        const preCaretRange = range.cloneRange();
        const contents = preCaretRange.selectNodeContents(el);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        start = preCaretRange.toString().length;
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        end = preCaretRange.toString().length;
      }
    } else if ((doc.selection) && sel.type !== 'Control') {
      sel = doc.selection;
      const textRange = sel.createRange();
      const preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(el);
      preCaretTextRange.setEndPoint('EndToStart', textRange);
      start = preCaretTextRange.text.length;
      preCaretTextRange.setEndPoint('EndToEnd', textRange);
      end = preCaretTextRange.text.length;
    }


    // caret positioning interms of innerhtml

    const target = document.createTextNode('\u0001');
    document.getSelection().getRangeAt(0).insertNode(target);
    const position = el.innerHTML.indexOf('\u0001');
    target.parentNode.removeChild(target);

    const caretPosition = {textContent: start, innerHTML: position};
    return caretPosition;
  }

  /**
   * Function for deleting the suggestion
   */

  deleteSuggestion() {
    const s = window.getSelection();
    const r = s.getRangeAt(0);
    const el = r.startContainer.parentElement;
    if (el.classList.contains('name')) {
      el.remove();
    }
  }

  /**
   * Listen to input changes and show menu
   */

  @HostListener('input', ['$event.target'])
  onChange(e: any) {
    const value = e.textContent;
    if (this.menu) {

      // check if the current character position has trigger character position
      if (value[this.menu.triggerCharacterPosition] !== this.triggerCharacter) {
        this.hideMenu();
      } else {

        // check if the current caret position is not changed
        const cursor = this.getCaretPosition().textContent;
        if (cursor < this.menu.triggerCharacterPosition) {
          this.hideMenu();
        } else {
          const searchText = value.slice(
            this.menu.triggerCharacterPosition + 1,
            cursor
          );

          // check for matches closed menu if none
          if (!searchText.match(this.searchRegexp)) {
            this.hideMenu();
          } else {
            this.menu.component.instance.searchText = searchText;
            this.menu.component.instance.choices = [];
            this.menu.component.instance.choiceLoadError = undefined;
            this.menu.component.instance.choiceLoading = true;
            this.menu.component.changeDetectorRef.detectChanges();
            this.menu.component.instance.choices = this.findSuggestions(searchText);
            this.menu.component.changeDetectorRef.detectChanges();
          }
        }
      }
    }
  }

  /**
   * Function to populate suggestions in menu
   */

  private findSuggestions(searchText: string) {
    return this.suggestions
      .filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()))
      .slice(0, this.suggestionCount);
  }

  /**
   * Function for assigning id used to create a
   * reference node for setting caret position
   */

  private assignId() {
    this.idCount++;
    return this.idCount;
  }

  /**
   * Function for showing the suggestions
   * called when trigger character is inputted
   */

  private showMenu() {
    const el = this.el.nativeElement;
    if (!this.menu) {
      const menuFactory = this.componentFactoryResolver.resolveComponentFactory<SuggestionsComponent>(this.suggestionsComponent);
      this.menu = {
        component: this.viewContainerRef.createComponent(
          menuFactory,
          0,
          this.injector
        ),
        triggerCharacterPosition: this.getCaretPosition().textContent
      };

      // render menu
      this.positionMenu();
      this.menu.component.changeDetectorRef.detectChanges();

      // subscribe to user selection
      this.menu.component.instance.selectChoice
        .pipe(takeUntil(this.menuHidden$))
        .subscribe(choice => {
          // the choice to be inserted
          const tag = `${choice.name}`;
          const value: string = el.innerHTML;

          // start index should be trigger position with innerhtml
          const startIndex = this.getCaretPosition().innerHTML - (this.menu.component.instance.searchText.length) - 1;

          // HTML values before inserted suggestion
          const start = value.slice(0, startIndex);
          console.log('start:' + start + ' startIndex: ' + startIndex);

          // HTML values after inserted Suggestion
          const caretPosition =
            this.menu.lastCaretPosition || (this.getCaretPosition().innerHTML);
          const end = value.slice(caretPosition);

          const html = start + `<span class='name' id='span${this.assignId()}'>${tag}</span>&#8203;` + end;
          this.el.nativeElement.innerHTML = html;

          // set caret position to the end of inserted node
          this.setCaret();
          this.hideMenu();

          this.choiceSelected.emit({
            choice,
            insertedAt: {
              start: startIndex,
              end: startIndex + tag.length
            }
          });
        });
      this.menuShown.emit();
    }
  }

  /**
   * A function that returns the positioning values of the suggestions component
   * taken from the current cursor positioning
   */
  private positionMenu(): any {
    const el = this.el.nativeElement;
    const doc = el.ownerDocument;
    const win = doc.defaultView || doc.parentWindow;
    const sel = win.getSelection();
    const range = sel.getRangeAt(0);
    const pos =  range.getBoundingClientRect();
    const elPos =  el.getBoundingClientRect();

    const lineHeight = +getComputedStyle(el).lineHeight.replace(/px$/, '');

    this.menu.component.instance.position = {
      top: (pos.top === 0) ?
        elPos.top + lineHeight :
        pos.top + lineHeight,
      left: (pos.left === 0) ?
        elPos.left :
        pos.left,
    };
  }

  /**
   * A function that sets the caret position to the end of the auto complete
   * with an additional space
   */
  private setCaret() {
    const selection = document.getSelection();
    const nodeId = 'span' + this.idCount;

    const el = this.el.nativeElement;
    const doc = el.ownerDocument;
    const range = doc.createRange();
    const referenceNode = doc.getElementById(nodeId);

    range.setStart(referenceNode.nextSibling, 1);
    range.setEnd(referenceNode.nextSibling, 1);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * A function that hides the menu and emits output event
   */
  private hideMenu() {
    if (this.menu) {
      this.menu.component.destroy();
      this.menuHidden$.next();
      this.menuHidden.emit();
      this.menu = undefined;
    }
  }

  ngOnDestroy() {
    this.hideMenu();
  }

}
