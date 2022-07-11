const Info = require('../models/info');
const Data = require('../models/data');
const { validationResult } = require('express-validator');
const moment = require('moment');
const fileHelper = require('../util/file');

//MENU:  STAFFINFO --> fetch staff
exports.getStaff = (req, res) =>{
  if (req.session.isAdmin) {
    return Info.find({'userAdmin._id': req.user._id})
      .then(staffs => {
        res.render('info/staffInfo', {
          pageTitle:'Thông tin nhân viên',
          path: '/staffinfo',
          staffs: staffs,
          moment: moment
        })
      })
      .catch(err => {console.log(err)});
  }
  Info.find({companyId: req.user.username})
    .then(staffs => {
      res.render('info/staffInfo', {
        pageTitle: 'Thông tin nhân viên',
        path: '/staffinfo',
        staffs: staffs,
        moment: moment
      })
    })
    .catch(err => {console.log(err)});
};


//MENU:  STAFFINFO --> add staff
exports.getAddStaff = (req, res) => {
  res.render('info/addStaff', {
    pageTitle: 'Thêm nhân viên',
    path: '/staffinfo',
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};
exports.postAddStaff = (req, res) => {
    const companyId = req.body.role + '-' + Math.floor((Math.random() * 1000) + 1);
    const name = req.body.name;
    const role = req.body.role;
    const doB = req.body.doB;
    const salaryScale = req.body.salaryScale;
    const startDate = req.body.startDate;
    const department = req.body.department;
    const annualLeave = req.body.annualLeave;
    const image = req.file;
    const status = '--';
    const userAdmin = {'_id': req.user._id, 'username': req.user.username};

    if (!image) {
      return res.status(422).render('info/addStaff', {
        pageTitle: 'Thêm nhân viên',
        path: '/staffinfo',
        hasError: true,
        staff: {name: name, role: role, doB: doB, salaryScale: salaryScale,  startDate: startDate, department: department, annualLeave: annualLeave},
        errorMessage: 'Attached file is not an image',
        validationErrors: []
      });
    }
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      fileHelper.deleteFile(image.path);
      return res.status(422).render('info/addStaff', {
        pageTitle: 'Thêm nhân viên',
        path: '/staffinfo',
        hasError: true,
        staff: {image: image, name: name, role: role, doB: doB, salaryScale: salaryScale,  startDate: startDate, department: department, annualLeave: annualLeave},
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array()
      });
    }
    const imageUrl = image.path;
    
    const newStaff = new Info({companyId, name, role, doB, salaryScale, startDate, department, annualLeave, imageUrl, status, userAdmin});
    const newData = new Data({companyId, name, salaryScale, annualLeave, timekeeping: [], bodyTemp: [], vaccine: {}, positive: [], leave: [], timekeepingPerDay: [], salary: [], confirmedStatus: true, userAdmin});
    newStaff.save().catch((err) => {console.log(err)});
    newData.save().then(() => {res.redirect('/')}).catch(err => {console.log(err)});
  };


//MENU:  STAFFINFO --> edit staff
exports.getEditStaff = (req, res) => {
  const companyId = req.params.companyId
  Info.findOne({companyId: companyId})
    .then(staff =>{
      res.render('info/editStaff', {
        pageTitle: 'Sửa nhân viên',
        path: '/staffinfo',
        staff: staff,
        moment: moment
      });
    })
    .catch(err => {console.log(err)});
};
exports.postEditStaff = (req, res) => {
  const image = req.file;

  Info.findOne({companyId: req.body.companyId})
    .then(staff => {
      // Quyền admin mới được edit hình
      // if (staff.userAdmin._id.toString() !== req.user._id.toString()) {
      //   return res.redirect('/');
      // }
      if (image) {
        fileHelper.deleteFile(staff.imageUrl);
        staff.imageUrl = image.path;
      }
      
      return staff.save().then(result => {res.redirect('/')});
    })
    .catch(err => {console.log(err)});
};


//MENU:  STAFFINFO --> delete staff
exports.postDeleteStaff = (req, res) => {
  const companyId = req.body.companyId;
  Info
    .findOne({companyId: companyId})
    .then(staff => {
      if (!staff) {
        return next(new Error('Không thể xoá vì không tìm thấy nhân viên trong CSDL.'));
      }
      fileHelper.deleteFile(staff.imageUrl);
      return Info.deleteOne({ companyId: companyId, 'userAdmin._id': req.user._id })
    })
    .then(() => {res.redirect('/')})
    .catch(err => {console.log(err)});
};

