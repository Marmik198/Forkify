import View from './View.js';

import icons from 'url:../../img/icons.svg'; // Parcel 2

//////////////////////////////////////////////////////

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerPagination(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');

      if (!btn) return;

      const gotoPage = +btn.dataset.goto;
      handler(gotoPage);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // Page 1, and there are other pages
    if (curPage === 1 && numPages > 1) {
      return this._generateMarkupNextButton(curPage);
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return this._generateMarkupPrevButton(curPage);
    }

    // Other Page
    if (curPage > 1 && curPage < numPages) {
      return (
        this._generateMarkupPrevButton(curPage) +
        this._generateMarkupNextButton(curPage)
      );
    }

    // Page 1, and there are no other pages
    else {
      return ``;
    }
  }

  _generateMarkupPrevButton(curPage) {
    return `
        <button data-goto="${
          curPage - 1
        }" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>
      `;
  }

  _generateMarkupNextButton(curPage) {
    return `
      <button data-goto="${
        curPage + 1
      }" class="btn--inline pagination__btn--next">
        <span>Page ${curPage + 1}</span>  
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>
    `;
  }
}

export default new PaginationView();
