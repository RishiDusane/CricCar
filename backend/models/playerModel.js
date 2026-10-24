const { getPool } = require('../config/database');

async function getAllPlayers() {
  const [players] = await getPool().query('SELECT * FROM players ORDER BY id DESC');
  return players;
}

async function searchPlayers(name) {
  const [players] = await getPool().execute(
    'SELECT * FROM players WHERE LOWER(name) LIKE LOWER(?) ORDER BY id DESC',
    [`%${name}%`]
  );
  return players;
}

async function getPlayerById(id) {
  const [players] = await getPool().execute(
    'SELECT * FROM players WHERE id = ?',
    [id]
  );
  return players[0] || null;
}

async function createPlayer(player) {
  const [result] = await getPool().execute(
    `INSERT INTO players
      (name, age, photo_url, birthplace, career_desc, matches, centuries, wickets, fifties, average)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      player.name,
      player.age,
      player.photo_url,
      player.birthplace,
      player.career_desc,
      player.matches,
      player.centuries,
      player.wickets,
      player.fifties,
      player.average
    ]
  );
  return getPlayerById(result.insertId);
}

async function updatePlayer(id, player) {
  await getPool().execute(
    `UPDATE players
     SET name = ?, age = ?, photo_url = ?, birthplace = ?, career_desc = ?,
         matches = ?, centuries = ?, wickets = ?, fifties = ?, average = ?
     WHERE id = ?`,
    [
      player.name,
      player.age,
      player.photo_url,
      player.birthplace,
      player.career_desc,
      player.matches,
      player.centuries,
      player.wickets,
      player.fifties,
      player.average,
      id
    ]
  );
  return getPlayerById(id);
}

async function deletePlayer(id) {
  const [result] = await getPool().execute(
    'DELETE FROM players WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getAllPlayers,
  searchPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer
};
