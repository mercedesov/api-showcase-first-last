const API_URL = 'https://rickandmortyapi.com/api/character';
const mainList = document.getElementById('main-list');
const favoritesList = document.getElementById('favorites-list');
const detailsContainer = document.getElementById('details-container');
const itemDetails = document.getElementById('item-details');
const backButton = document.getElementById('back-button');
const viewMainButton = document.getElementById('view-main');
const viewFavoritesButton = document.getElementById('view-favorites');
const loading = document.getElementById('loading');

// Store for favorites
let favorites = [];

// Fetch all characters, including pagination
async function fetchAllItems() {
  let url = API_URL;
  let allCharacters = [];
  try {
    showLoading(true);
    while (url) {
      const response = await fetch(url);
      const data = await response.json();
      allCharacters = allCharacters.concat(data.results);
      url = data.info.next;
    }
    displayItems(allCharacters, mainList);
    showLoading(false);
  } catch (error) {
    console.error('Error fetching items:', error);
    mainList.innerHTML = '<p>Failed to load data. Please try again later.</p>';
  }
}

// Display items in a list
function displayItems(items, container) {
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <h2>${item.name}</h2>
      <button class="view-details" data-id="${item.id}">View Details</button>
      <button class="toggle-favorite" data-id="${item.id}">
        ${favorites.some(fav => fav.id === item.id) ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
    `;
    container.appendChild(card);
  });

  // Add event listeners
  container.querySelectorAll('.view-details').forEach(button => {
    button.addEventListener('click', event => {
      const itemId = event.target.getAttribute('data-id');
      viewDetails(itemId);
    });
  });

  container.querySelectorAll('.toggle-favorite').forEach(button => {
    button.addEventListener('click', event => {
      const itemId = parseInt(event.target.getAttribute('data-id'));
      toggleFavorite(itemId);
    });
  });
}

// Fetch and display details for a specific character
async function viewDetails(itemId) {
  try {
    const response = await fetch(`${API_URL}/${itemId}`);
    const item = await response.json();

    detailsContainer.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <h2>${item.name}</h2>
      <p><strong>Status:</strong> ${item.status}</p>
      <p><strong>Species:</strong> ${item.species}</p>
      <p><strong>Gender:</strong> ${item.gender}</p>
      <p><strong>Origin:</strong> ${item.origin.name}</p>
      <p><strong>Location:</strong> ${item.location.name}</p>
    `;

    itemDetails.classList.remove('hidden');
    mainList.style.display = 'none';
    favoritesList.style.display = 'none';
  } catch (error) {
    console.error('Error fetching item details:', error);
    detailsContainer.innerHTML = '<p>Failed to load details. Please try again later.</p>';
  }
}

// Add or remove a character from favorites
function toggleFavorite(itemId) {
  const existingIndex = favorites.findIndex(fav => fav.id === itemId);
  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
  } else {
    const item = Array.from(mainList.querySelectorAll('.card')).find(card =>
      card.querySelector('.toggle-favorite').getAttribute('data-id') == itemId
    );
    const itemData = {
      id: itemId,
      name: item.querySelector('h2').textContent,
      image: item.querySelector('img').src,
    };
    favorites.push(itemData);
  }
  displayItems(favorites, favoritesList);
  displayItems(Array.from(mainList.querySelectorAll('.card')).map(card => ({
    id: parseInt(card.querySelector('.toggle-favorite').getAttribute('data-id')),
    name: card.querySelector('h2').textContent,
    image: card.querySelector('img').src,
  })), mainList);
}

// Show/hide sections
viewMainButton.addEventListener('click', () => {
  mainList.style.display = 'flex';
  favoritesList.style.display = 'none';
  itemDetails.classList.add('hidden');
});

viewFavoritesButton.addEventListener('click', () => {
  mainList.style.display = 'none';
  favoritesList.style.display = 'flex';
  itemDetails.classList.add('hidden');
});

// Show/hide loading indicator
function showLoading(isLoading) {
  loading.classList.toggle('hidden', !isLoading);
}

// Initialize
fetchAllItems();
