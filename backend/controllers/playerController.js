const playerModel = require('../models/playerModel');

function getPlayerData(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Player data must be a JSON object.' };
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return { error: 'Name is required.' };
  }
  if (name.length > 100) {
    return { error: 'Name must be 100 characters or fewer.' };
  }

  const optionalText = (value, field, maxLength) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    if (typeof value !== 'string' || value.length > maxLength) {
      return { error: `${field} must be ${maxLength} characters or fewer.` };
    }
    return value.trim() || null;
  };

  const age = getNumber(body.age, 'Age', { integer: true, optional: true, max: 150 });
  const matches = getNumber(body.matches, 'No. of Matches', { integer: true, defaultValue: 0, max: 2147483647 });
  const centuries = getNumber(body.centuries, 'Centuries', { integer: true, defaultValue: 0, max: 2147483647 });
  const wickets = getNumber(body.wickets, 'Wickets', { integer: true, defaultValue: 0, max: 2147483647 });
  const fifties = getNumber(body.fifties, 'Fifties', { integer: true, defaultValue: 0, max: 2147483647 });
  const average = getNumber(body.average, 'Average', { defaultValue: 0, max: 9999.99 });
  const photoUrl = optionalText(body.photo_url, 'Photo URL', 2000);
  const birthplace = optionalText(body.birthplace, 'Birthplace', 150);
  const careerDescription = optionalText(body.career_desc, 'Career Description', 10000);

  for (const value of [
    age,
    matches,
    centuries,
    wickets,
    fifties,
    average,
    photoUrl,
    birthplace,
    careerDescription
  ]) {
    if (value && typeof value === 'object' && value.error) {
      return value;
    }
  }

  return {
    player: {
      name,
      age,
      photo_url: photoUrl,
      birthplace,
      career_desc: careerDescription,
      matches,
      centuries,
      wickets,
      fifties,
      average
    }
  };
}

function getNumber(value, field, options = {}) {
  if (value === undefined || value === null || value === '') {
    return options.optional ? null : options.defaultValue;
  }

  if (typeof value !== 'number' && typeof value !== 'string') {
    return { error: `${field} must be a valid non-negative${options.integer ? ' whole' : ''} number.` };
  }

  const number = Number(value);
  if (
    !Number.isFinite(number) ||
    number < 0 ||
    (options.integer && !Number.isInteger(number)) ||
    (options.max !== undefined && number > options.max)
  ) {
    return { error: `${field} must be a valid non-negative${options.integer ? ' whole' : ''} number.` };
  }

  return number;
}

function getId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function getAllPlayers(req, res) {
  try {
    const players = await playerModel.getAllPlayers();
    res.json(players);
  } catch (error) {
    console.error('Error retrieving players:', error.message);
    res.status(500).json({ message: 'Unable to retrieve players.' });
  }
}

async function searchPlayers(req, res) {
  if (req.query.name !== undefined && typeof req.query.name !== 'string') {
    return res.status(400).json({ message: 'Search name must be a single string.' });
  }

  try {
    const players = await playerModel.searchPlayers(req.query.name || '');
    res.json(players);
  } catch (error) {
    console.error('Error searching players:', error.message);
    res.status(500).json({ message: 'Unable to search players.' });
  }
}

async function getPlayerById(req, res) {
  const id = getId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Player ID must be a positive integer.' });
  }

  try {
    const player = await playerModel.getPlayerById(id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found.' });
    }
    res.json(player);
  } catch (error) {
    console.error('Error retrieving player:', error.message);
    res.status(500).json({ message: 'Unable to retrieve the player.' });
  }
}

async function createPlayer(req, res) {
  const result = getPlayerData(req.body);
  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  try {
    const player = await playerModel.createPlayer(result.player);
    res.status(201).json({ message: 'Player added successfully.', player });
  } catch (error) {
    console.error('Error adding player:', error.message);
    res.status(500).json({ message: 'Unable to add the player.' });
  }
}

async function updatePlayer(req, res) {
  const id = getId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Player ID must be a positive integer.' });
  }

  const result = getPlayerData(req.body);
  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  try {
    const player = await playerModel.updatePlayer(id, result.player);
    if (!player) {
      return res.status(404).json({ message: 'Player not found.' });
    }
    res.json({ message: 'Player updated successfully.', player });
  } catch (error) {
    console.error('Error updating player:', error.message);
    res.status(500).json({ message: 'Unable to update the player.' });
  }
}

async function deletePlayer(req, res) {
  const id = getId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Player ID must be a positive integer.' });
  }

  try {
    const deleted = await playerModel.deletePlayer(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Player not found.' });
    }
    res.json({ message: 'Player deleted successfully.' });
  } catch (error) {
    console.error('Error deleting player:', error.message);
    res.status(500).json({ message: 'Unable to delete the player.' });
  }
}

module.exports = {
  getAllPlayers,
  searchPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer
};
