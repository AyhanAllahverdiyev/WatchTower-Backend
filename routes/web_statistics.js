
 const express = require("express");
const webStatisticsController = require("../controllers/web_statisticsController");
 const router = express.Router();

router.get("/totalUserCount", webStatisticsController.getUserCount);
router.get("/totalTagCount",webStatisticsController.totalTagCount);
router.get('/activeSessionCount',webStatisticsController.getActiveSessionNumber)
router.get('/alertNumberForToday',webStatisticsController.alertNumberForToday);
router.get('/lineChartData',webStatisticsController.lineChartData);

module.exports = router;