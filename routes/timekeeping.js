const express = require('express');
const timekeepingCtrl = require('../controllers/timekeeping');
const router = express.Router();
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');

// MENU: Chấm công, PATH: /timekeeping
router.get('/',isAuth, timekeepingCtrl.getStaff);

router.get('/checkin/:companyId', isAuth, timekeepingCtrl.getCheckIn);
router.post('/checkin', isAuth, timekeepingCtrl.postCheckIn);


router.get('/checkout/:companyId', isAuth, timekeepingCtrl.getCheckOut)
router.post('/checkout', isAuth, timekeepingCtrl.postCheckOut);


router.get('/registryleave/:companyId', isAuth, timekeepingCtrl.getLeave)
router.post('/registryleave', [
    body('endLeave').isDate().custom((value, { req }) => {
        if (new Date(value).getTime() < new Date(req.body.startLeave).getTime()) {throw new Error('Your end day less than start day!')}
        return true;
    }),
    body('leaveHours').custom((value, { req }) => {
      if ( req.body.remainingDays < ((new Date(req.body.endLeave).getTime() - new Date(req.body.startLeave).getTime())/86400000+1)*value/8 ) {throw new Error('Bạn đã đăng kí thời gian nghỉ phép vượt quá số ngày phép còn lại!')}
      return true;
    }),
    body('reason', 'Reason has at least 2 characters.').isString().isLength({ min: 2}).trim()
  ], isAuth, timekeepingCtrl.postLeave);

module.exports = router;
