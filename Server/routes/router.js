const { Router } = require('express');
const GameController = require('../controller/gameController');
const router = Router();


router.post('/addPoint/:phoneNumber/:points', GameController.AddPoint);
router.get('/getRanking', GameController.GetRanking);
router.get('/rank/:phoneNumber', GameController.GetUserRank);
router.post('/reduce-points/:phoneNumber/:points', GameController.ReducePoint);

router.get('/getPackage', GameController.GetPackage);

module.exports = router;
