import './Keyboard.css';

// Services
import KeyboardLayout from '../services/KeyboardLayout';
import Utilities from '../services/Utilities';

class SimpleKeyboard {
  constructor(...params){
    let keyboardDOMQuery = typeof params[0] === "string" ? params[0] : '.simple-keyboard';
    let options = typeof params[0] === "object" ? params[0] : params[1];

    if(!options)
      options = {};

    /**
     * Processing options
     */
    this.keyboardDOM = document.querySelector(keyboardDOMQuery);
    this.options = options;
    this.options.layoutName = this.options.layoutName || "default";
    this.options.theme = this.options.theme || "hg-theme-default";
    this.options.inputName = this.options.inputName || "default";
    this.input = {};
    this.input[this.options.inputName] = '';
    this.keyboardDOMClass = keyboardDOMQuery.split('.').join("");

    /**
     * Rendering keyboard
     */
    if(this.keyboardDOM)
      this.render();
    else
      console.error(`"${keyboardDOMQuery}" was not found in the DOM.`);
  }

  handleButtonClicked = (button) => {
    let debug = this.options.debug;
    
    /**
     * Ignoring placeholder buttons
     */
    if(button === '{//}')
      return false;

    /**
     * Calling onKeyPress
     */
    if(typeof this.options.onKeyPress === "function")
      this.options.onKeyPress(button);

    /**
     * Updating input
     */
    let options = {
      newLineOnEnter: (this.options.newLineOnEnter === true)
    }
    
    if(!this.input[this.options.inputName])
      this.input[this.options.inputName] = '';

    let updatedInput = Utilities.getUpdatedInput(button, this.input[this.options.inputName], options);

    if(this.input[this.options.inputName] !== updatedInput){
      this.input[this.options.inputName] = updatedInput;

      if(debug)
        console.log('Input changed:', this.input);

      /**
       * Calling onChange
       */
      if(typeof this.options.onChange === "function")
        this.options.onChange(this.input[this.options.inputName]);
    }
    
    if(debug){
      console.log("Key pressed:", button);
    }
  }

  clearInput = (inputName) => {
    inputName = inputName || this.options.inputName;
    this.input[this.options.inputName] = '';
  }

  getInput = (inputName) => {
    inputName = inputName || this.options.inputName;
    return this.input[this.options.inputName];
  }

  setInput = (input, inputName) => {
    inputName = inputName || this.options.inputName;
    this.input[inputName] = input;
  }

  setOptions = option => {
    option = option || {};
    this.options = Object.assign(this.options, option);
    this.render();
  }

  clear = () => {
    this.keyboardDOM.innerHTML = '';
    this.keyboardDOM.className = this.keyboardDOMClass;
  }

  render = () => {
    /**
     * Clear keyboard
     */
    this.clear();

    let layoutClass = this.options.layout ? "hg-layout-custom" : `hg-layout-${this.options.layoutName}`;
    let layout = this.options.layout || KeyboardLayout.getLayout(this.options.layoutName);

    /**
     * Account for buttonTheme, if set
     */
    let buttonThemesParsed = {};
    if(Array.isArray(this.options.buttonTheme)){
      this.options.buttonTheme.forEach(themeObj => {
        if(themeObj.buttons && themeObj.class){
          let themeButtons = themeObj.buttons.split(' ');

          if(Array.isArray(themeButtons)){
            themeButtons.forEach(themeButton => {
              let themeParsed = buttonThemesParsed[themeButton];

              // If the button has already been added
              if(themeParsed)
                buttonThemesParsed[themeButton] = `${themeParsed} ${themeObj.class}`;
              else
                buttonThemesParsed[themeButton] = themeObj.class;
            });
          }
        } else {
          console.warn(`buttonTheme row is missing the "buttons" or the "class". Please check the documentation.`)
        }
      });
    }

    /**
     * Adding themeClass, layoutClass to keyboardDOM
     */
    this.keyboardDOM.className += ` ${this.options.theme} ${layoutClass}`;

    /**
     * Iterating through each row
     */
    layout[this.options.layoutName].forEach((row) => {
      let rowArray = row.split(' ');

      /**
       * Creating empty row
       */
      var rowDOM = document.createElement('div');
      rowDOM.className += "hg-row";

      /**
       * Iterating through each button in row
       */
      rowArray.forEach((button) => {
        let fctBtnClass = Utilities.getButtonClass(button);
        let buttonThemeClass = buttonThemesParsed[button];
        let buttonDisplayName = Utilities.getButtonDisplayName(button, this.options.display);

        /**
         * Creating button
         */
        var buttonDOM = document.createElement('div');
        buttonDOM.className += `hg-button ${fctBtnClass}${buttonThemeClass ? " "+buttonThemeClass : ""}`;
        buttonDOM.onclick = () => this.handleButtonClicked(button);

        /**
         * Adding button label to button
         */
        var buttonSpanDOM = document.createElement('span');
        buttonSpanDOM.innerHTML = buttonDisplayName;
        buttonDOM.appendChild(buttonSpanDOM);

        /**
         * Appending button to row
         */
        rowDOM.appendChild(buttonDOM);

        /**
         * Calling onInit
         */
        if(typeof this.options.onInit === "function")
        this.options.onInit();

      });

      /**
       * Appending row to keyboard
       */
      this.keyboardDOM.appendChild(rowDOM);
    });
  }
}

export default SimpleKeyboard;
