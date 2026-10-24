const express = require('express');
const playerController = require('../controllers/playerController');

const router = express.Router();

router.get('/search', playerController.searchPlayers);
router.get('/', playerController.getAllPlayers);
router.get('/:id', playerController.getPlayerById);
router.post('/', playerController.createPlayer);
router.put('/:id', playerController.updatePlayer);
router.delete('/:id', playerController.deletePlayer);

module.exports = router;
