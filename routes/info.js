const express = require('express');
const staffInfoCtrl = require('../controllers/info');

const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// MENU: Staff Info, PATH: /
router.get('/', isAuth, staffInfoCtrl.getStaff);

router.get('/addstaff', isAuth, staffInfoCtrl.getAddStaff);
router.post('/addstaff',[
    body('name').isString().isLength({ min: 3, max: 30 }).trim(),
    body('doB').isDate().custom((value, { req }) => {
      if (new Date(value).getTime() > new Date().getTime()) {throw new Error('Your date of birth is greater than today!')}
      return true;
    }),
    body('salaryScale').isFloat().custom((value, { req }) => {
      if (value <=0) {throw new Error('salaryScale must be greater than 0!')}
      return true;
    }),
    body('startDate').isDate().custom((value, { req }) => {
      if (new Date(value).getTime() <= new Date(req.body.doB).getTime()) {throw new Error('Your startDate is less than doB!')}
      return true;
    }),
    body('department').isString().isLength({ min: 2, max: 30}).trim(),
    body('annualLeave').isFloat().custom((value, { req }) => {
      if (value <=0) {throw new Error('annualLeave must be greater than 0!')}
      return true;
    }),
    body('status').isString().isLength({ min: 2 }).trim(),
  ], isAuth, staffInfoCtrl.postAddStaff);

router.get('/editstaff/:companyId', isAuth, staffInfoCtrl.getEditStaff);
router.post('/editstaff', isAuth, staffInfoCtrl.postEditStaff);

router.post('/deletestaff', isAuth, staffInfoCtrl.postDeleteStaff);

module.exports = router;
