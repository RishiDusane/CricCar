const playerForm = document.getElementById('player-form');
const playerList = document.getElementById('player-list');
const message = document.getElementById('message');
const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit-button');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const showAllButton = document.getElementById('show-all-button');

let editingPlayerId = null;
let activeSearch = '';

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const responseText = await response.text();
  let data;

  if (responseText.trim()) {
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      const details = responseText.trim().slice(0, 200);
      if (!response.ok) {
        throw new Error(`Request failed with HTTP ${response.status}: ${details}`);
      }
      throw new Error(`Expected a JSON response from ${url}, but received: ${details}`);
    }
  }

  if (!response.ok) {
    const errorMessage = data && typeof data.message === 'string'
      ? data.message
      : `Request failed with HTTP ${response.status} for ${url}.`;
    throw new Error(errorMessage);
  }

  if (data === undefined) {
    throw new Error(`Expected a JSON response from ${url}, but the server returned an empty body (HTTP ${response.status}).`);
  }

  return data;
}

function addDetail(container, label, value) {
  const detail = document.createElement('p');
  detail.textContent = `${label}: ${value === null || value === '' ? 'Not provided' : value}`;
  container.appendChild(detail);
}

function createPlayerCard(player) {
  const card = document.createElement('article');
  card.className = 'player-card';

  const fallback = document.createElement('div');
  fallback.className = 'photo-fallback';
  fallback.textContent = 'No photo available';
  card.appendChild(fallback);

  if (player.photo_url) {
    const image = document.createElement('img');
    image.className = 'player-photo';
    image.src = player.photo_url;
    image.alt = `${player.name} photo`;
    image.addEventListener('load', () => fallback.remove());
    image.addEventListener('error', () => image.remove());
    card.insertBefore(image, fallback);
  }

  const details = document.createElement('div');
  details.className = 'player-details';
  const name = document.createElement('h3');
  name.textContent = player.name;
  details.appendChild(name);

  addDetail(details, 'Age', player.age);
  addDetail(details, 'Birthplace', player.birthplace);
  addDetail(details, 'Career Description', player.career_desc);
  addDetail(details, 'No. of Matches', player.matches);
  addDetail(details, 'Centuries', player.centuries);
  addDetail(details, 'Wickets', player.wickets);
  addDetail(details, 'Fifties', player.fifties);
  addDetail(details, 'Average', player.average);

  const actions = document.createElement('div');
  actions.className = 'player-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => editPlayer(player));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => deletePlayer(player.id));

  actions.append(editButton, deleteButton);
  details.appendChild(actions);
  card.appendChild(details);
  return card;
}

async function loadPlayers(searchName = '') {
  playerList.replaceChildren();
  try {
    const query = searchName ? `?name=${encodeURIComponent(searchName)}` : '';
    const endpoint = searchName ? `/api/players/search${query}` : '/api/players';
    const players = await request(endpoint);

    if (players.length === 0) {
      const emptyState = document.createElement('p');
      emptyState.className = 'empty-state';
      emptyState.textContent = searchName
        ? 'No matching players found.'
        : 'No players have been added yet.';
      playerList.appendChild(emptyState);
      if (searchName) {
        showMessage('No matching players found.');
      }
      return true;
    }

    players.forEach((player) => playerList.appendChild(createPlayerCard(player)));
    return true;
  } catch (error) {
    showMessage(error.message, true);
    const errorState = document.createElement('p');
    errorState.className = 'empty-state';
    errorState.textContent = 'Players could not be loaded. Check the server and database.';
    playerList.appendChild(errorState);
    return false;
  }
}

function resetForm() {
  playerForm.reset();
  editingPlayerId = null;
  submitButton.textContent = 'Submit';
  cancelEditButton.hidden = true;
}

function editPlayer(player) {
  for (const field of playerForm.elements) {
    if (field.name && Object.prototype.hasOwnProperty.call(player, field.name)) {
      field.value = player[field.name] ?? '';
    }
  }
  editingPlayerId = player.id;
  submitButton.textContent = 'Update Player';
  cancelEditButton.hidden = false;
  playerForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

playerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const player = Object.fromEntries(new FormData(playerForm).entries());
  const isEditing = editingPlayerId !== null;
  const url = isEditing ? `/api/players/${editingPlayerId}` : '/api/players';

  try {
    const result = await request(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player)
    });
    resetForm();
    activeSearch = '';
    searchInput.value = '';
    showMessage(result.message);
    await loadPlayers();
  } catch (error) {
    showMessage(error.message, true);
  }
});

cancelEditButton.addEventListener('click', resetForm);

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  activeSearch = searchInput.value.trim();
  await loadPlayers(activeSearch);
  if (activeSearch && playerList.querySelector('.player-card')) {
    showMessage(`Search results for "${activeSearch}".`);
  }
});

showAllButton.addEventListener('click', async () => {
  searchInput.value = '';
  activeSearch = '';
  const loaded = await loadPlayers();
  if (loaded) {
    showMessage('');
  }
});

async function deletePlayer(id) {
  if (!confirm('Are you sure you want to delete this player?')) {
    return;
  }

  try {
    const result = await request(`/api/players/${id}`, { method: 'DELETE' });
    showMessage(result.message);
    await loadPlayers(activeSearch);
  } catch (error) {
    showMessage(error.message, true);
  }
}

loadPlayers();
