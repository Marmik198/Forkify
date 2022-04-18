///// IMPORTS /////
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable'; // Polyfiling eveything else
import 'regenerator-runtime/runtime'; // Polyfiling async/await

// API:  https://forkify-api.herokuapp.com/v2

///////////////////////////////////////////////////

/**
 * Controls the recipes of the application
 * @type async
 * @returns {undefined}
 * @author Marmik Shah
 */
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    /// 0. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    /// 1. Load Recipe Data
    await model.loadRecipe(id);

    /// 2. Render Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

/**
 * Controls the recipe search results of the application
 * @type async
 * @returns {undefined}
 * @author Marmik Shah
 */
const conrolSearchResults = async function () {
  try {
    // 1. Get Search Query
    const query = searchView.getQuery();
    if (!query) return;

    resultsView.renderSpinner();

    // 2. Load search results
    await model.loadSearchResult(query);

    // 3. Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4. Render initial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Controls pagination of the application
 * @returns {undefined}
 * @author Marmik Shah
 */
const controlPagination = function (goToPage) {
  // 1. Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2. Render new pagination button
  paginationView.render(model.state.search);
};

/**
 * Controls the updation of servings in a recipe
 * @returns {undefined}
 * @author Marmik Shah
 */
const controlServings = function (newServings) {
  // 1. Update recipe servings in state
  model.updateServings(newServings);

  // 2. Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

/**
 * Controls updation of Bookmark of the application
 * @returns {undefined}
 * @author Marmik Shah
 */
const controlAddBookmark = function () {
  // 1. Update Bookmark
  model.updateBookmark(model.state.recipe);

  // 2. Update the recipe view
  recipeView.update(model.state.recipe);

  // 3. Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

/**
 * Renders the bookmarks
 * @returns {undefined}
 * @author Marmik Shah
 */
const controlBookmark = function () {
  bookmarksView.render(model.state.bookmarks);
};

/**
 * Controls the addition of recipes
 * @type async
 * @returns {undefined}
 * @author Marmik Shah
 */
const controlAddRecipe = async function (newRecipe) {
  try {
    // 0. Render Loading Spinner
    addRecipeView.renderSpinner();

    // 1. Upload Recipe
    await model.uploadRecipe(newRecipe);

    // 2.Render in Bookmark
    bookmarksView.render(model.state.bookmarks);

    // 3. Render recipe
    recipeView.render(model.state.recipe);

    // 4. Success Message
    addRecipeView.renderMessage();

    // 5. Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // 6. Close Form Window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

    // 7. Rerender Form
    setTimeout(function () {
      addRecipeView.display();
    }, (MODAL_CLOSE_SEC + 2) * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

/**
 * Initial Function
 */
(function () {
  bookmarksView.addHandlerLoadBookmark(controlBookmark);
  recipeView.addHandlerRecipe(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(conrolSearchResults);
  paginationView.addHandlerPagination(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
})();
