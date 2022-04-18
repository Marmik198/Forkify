import icons from 'url:../../img/icons.svg'; // Parcel 2

export default class View {
  _data;

  /**
   * Render the recieved object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. Recipe)
   * @param {boolean} [isRender = true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if isRender = false
   * @this {Object} View Instance
   * @author Marmik Shah
   */
  render(data, isRender = true) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return this.renderError();
    }

    this._data = data;
    const markup = this._generateMarkup();

    if (!isRender) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Render the default markup to the DOM
   * @this {Object} View Instance
   * @author Marmik Shah
   */
  display() {
    const markup = this._generateMarkup();
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Update the recieved object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. Recipe)
   * @this {Object} View Instance
   * @author Marmik Shah
   */
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    // Will conver the string into real DOM node objects (virtual DOM as it isnt rendered)
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newELements = Array.from(newDOM.querySelectorAll('*'));
    const curELements = Array.from(this._parentElement.querySelectorAll('*'));

    newELements.forEach((newEl, i) => {
      const curEl = curELements[i];

      // Updates changed text
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      // Updates changed attribute
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  /**
   * Clear the DOM
   */
  _clear() {
    this._parentElement.innerHTML = '';
  }

  /**
   * Render the Spinner to the DOM
   */
  renderSpinner() {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Render the Error Message to the DOM
   * @param {string} errorMessage
   */
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Render the Success Message to the DOM
   * @param {string} message
   */
  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
