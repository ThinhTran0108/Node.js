const express = require('express');
const approvalCtrl = require('../controllers/approval');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

// MENU: Xac nhan gio lam, PATH: /approval
router.get('/', isAuth, approvalCtrl.getStaff);

router.get('/getinfo/:companyId', isAuth, approvalCtrl.getInfo);
router.post('/getinfobymonth', isAuth, approvalCtrl.postMonth);

router.get('/confirmdata/:companyId', isAuth, approvalCtrl.confirmData);
router.post('/editdata', isAuth, approvalCtrl.editData);
router.post('/deletedata', isAuth, approvalCtrl.deleteData);


module.exports = router;
 