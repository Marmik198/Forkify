import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helpers.js';

//////////////////////////////////////////////////////

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

/**
 * Creates a recipe object (to be stored in the state of the application)
 * @param {Object} data The recipe data
 * @returns {Object} Recipe is returned
 * @author Marmik Shah
 */
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    bookmarked: false,
    ...(recipe.key && { key: recipe.key }),
  };
};

/**
 * Loads the recipe from the API
 * @type async
 * @param {string} id Id of the recipe to be loaded
 * @returns {Promise}
 * @author Marmik Shah
 */
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(b => b.id === id)) state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err;
  }
};

/**
 * Loads the search results from the API
 * @type async
 * @param {string} query It is the keyword that is searched
 * @returns {Promise}
 * @author Marmik Shah
 */
export const loadSearchResult = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err;
  }
};

/**
 * Loads the pagination according to the number of search results
 * @param {integer} [page = state.search.page] Page to be rendered
 * @returns {Object} Search Results in the desired page
 * @author Marmik Shah
 */
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

/**
 * Update the servings in a recipe
 * @param {Object} newServings Recipe with updated number of servings and ingredients
 * @author Marmik Shah
 */
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity *= newServings / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

/**
 * Store the bookmarks in Local Storage
 */
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

/**
 * Update the bookmarked property of the recipe to true/false
 * @param {Object} recipe Recipe to be bookmarked
 */
export const updateBookmark = function (recipe) {
  // Mark Current recipe as bookmark
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = !state.recipe.bookmarked;
  }

  // Delete Bookmark
  if (!state.recipe.bookmarked) {
    const index = state.bookmarks.findIndex(
      bookmark => bookmark.id === recipe.id
    );
    state.bookmarks.splice(index, 1);
  }
  // Add Bookmark
  else state.bookmarks.push(recipe);

  // Store in Local Storage
  persistBookmarks();
};

// Usefule while development
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

/**
 * Upload a new recipe to the API with the help of API-KEY
 * @type async
 * @param {*} newRecipe Recipe to be uploaded
 * @returns {Promise}
 * @author Marmik Shah
 */
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format. Please use the correct format :)'
          );

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      servings: +newRecipe.servings,
      cooking_time: +newRecipe.cookingTime,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);

    updateBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

/**
 * Initial Function
 */
(function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
})();
