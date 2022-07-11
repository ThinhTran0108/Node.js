const express = require('express');

const { body } = require('express-validator');
const covidCtrl = require('../controllers/covid');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
// MENU: Covid, PATH: /covid
router.get('/', isAuth, covidCtrl.getStaff);

router.get('/bodytemperature/:companyId', isAuth, covidCtrl.getBodyTemperature)
router.post('/bodytemperature', [
    body('dateTemp').isDate().custom((value, { req }) => {
      if (new Date(value).getTime() > new Date().getTime()) {throw new Error('Your date is greater than today!')}
      return true;
    }),
    body('temp').isFloat().custom((value, { req }) => {
      if (value <=36 || value >= 42) {throw new Error('Temperature must be between 36 and 42 Celsius degree!')}
      return true;
    })
  ], isAuth, covidCtrl.postBodyTemperature);


router.get('/vaccine/:companyId', isAuth, covidCtrl.getVaccine);
router.post('/vaccine', [
    body('dateVac_1').isDate().custom((value, { req }) => {
      if (new Date(value).getTime() > new Date().getTime()) {throw new Error('Your first date is greater than today!')}
      return true;
    }),
    body('vac_1', 'Name of vaccine has at least 2 character.').isString().isLength({ min: 2}).trim(),
    body('dateVac_2').isDate().custom((value, { req }) => {
        if (new Date(value).getTime() > new Date().getTime() || new Date(value).getTime() <= new Date(req.body.dateVac_1).getTime()) {throw new Error('Your second date must be greater than first day and less than or equal today!')}
        return true;
      }),
    body('vac_2', 'Name of vaccine has at least 2 character.').isString().isLength({ min: 2}).trim()
  ], isAuth, covidCtrl.postVaccine);


router.get('/positive/:companyId', isAuth, covidCtrl.getPositive);
router.post('/positive', [
    body('datePositive').isDate().custom((value, { req }) => {
      if (new Date(value).getTime() > new Date().getTime()) {throw new Error('Your date is greater than today!')}
      return true;
    }),
  ], isAuth, covidCtrl.postPositive);

router.get('/staffs', isAuth, covidCtrl.getCovidStaffs);
router.get('/download/:companyId', isAuth, covidCtrl.getDownload);


module.exports = router;
