const express = require('express');
const workingHoursCtrl = require('../controllers/workingHours');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

// MENU: Tra cuu gio lam, PATH: /workinghours
router.get('/', isAuth, workingHoursCtrl.getStaff);

router.get('/details/:companyId', isAuth, workingHoursCtrl.getDetails);
router.post('/details', isAuth,  workingHoursCtrl.postDetails);


router.get('/summary/:companyId', isAuth, workingHoursCtrl.getSummary);
router.post('/summary', isAuth,  workingHoursCtrl.postSummary);


router.get('/salary/:companyId', isAuth, workingHoursCtrl.getSalary);
router.post('/salary', isAuth,  workingHoursCtrl.postSalary);

router.get('/search/:companyId', isAuth, workingHoursCtrl.getSearch);
router.post('/search', isAuth, workingHoursCtrl.postSearch);

module.exports = router;
 