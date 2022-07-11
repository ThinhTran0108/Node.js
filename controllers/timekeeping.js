const Data = require('../models/data');
const Info = require('../models/info');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectId;
const { validationResult } = require('express-validator');


//MENU:  TIMEKEEPING --> fetch staff
exports.getStaff = (req, res) =>{
  if (req.session.isAdmin) {
    return Info.find({'userAdmin._id': req.user._id})
      .then(staffs => {
        res.render('timekeeping/timekeeping', {
          pageTitle:'Chấm công',
          path: '/timekeeping',
          staffs: staffs,
          moment: moment
        })
      })
      .catch(err => {console.log(err)});
  }
  Info.find({companyId: req.user.username})
  .then(staffs=>{res.render('timekeeping/timekeeping', {
    pageTitle: 'Chấm công',
    path: '/timekeeping',
    staffs: staffs,
    moment: moment
  })})
  .catch(err => {console.log(err)});
}


//MENU:  TIMEKEEPING --> checkin
exports.getCheckIn = (req, res) => {
  const companyId = req.params.companyId;

  Data.findOne({companyId: companyId}).then(data =>{
    Info.findOne({companyId: companyId}).then((staff)=>{
      return res.render('timekeeping/checkIn', {
        pageTitle: 'Điểm danh',
        path: '/timekeeping',
        data: data,
        staff: staff,
        moment: moment
      })
    })
  }).catch(err => console.log(err))
};
exports.postCheckIn = (req, res) => {
  const companyId = req.body.companyId;
  const status = "Đang làm việc";
  const date = moment(req.body.date).format("YYYY-MM-DD");
  const monthOfYear = moment(req.body.date).format("MM-YYYY");
  const workplace = req.body.workplace;
  const timeStart = moment().add(7, 'hours').format('HH:mm:ss');
  //lấy giờ nghỉ phép (nếu có) có cùng ngày với ngày thực hiện checkin
  let leaveHours = 0;
  Data.findOne({companyId: companyId}).then(data => {
    for (item of data.leave) {
      if (new Date(item.startLeave).getTime() <= new Date(date).getTime() && new Date(date).getTime() <= new Date(item.endLeave).getTime()) {
         leaveHours += item.leaveHours;
        }
    };
    // upload dữ liệu checkin và load lại page checkin với dữ liệu đã cập nhật
    Data.findOneAndUpdate(
      {companyId: companyId}, 
      {$push: 
        {timekeeping:
          {
            date: date,
            monthOfYear: monthOfYear,
            workplace: workplace,
            timeStart: timeStart, 
            timeEnd: null, 
            workHours: 0,
            workHoursPerDay : 0,
            workHoursPerMonth: 0,
            leaveHours: leaveHours
          }
        },
        $set:
          {
            confirmedStatus: false //chế độ cho phép admin confirm data
          }
      },
      {new: true},
      (err, data)=>{
        // chuyển sang trạng thái 'đang làm việc' và load lại page checkIn
        Info.findOneAndUpdate({companyId: companyId}, {$set: {status: status}}, {new: true}, (err, staff)=>{
          res.render('timekeeping/checkIn', {
            pageTitle: 'Điểm danh',
            path: '/timekeeping',
            data: data,
            staff: staff,
            moment: moment
          })
        })
      }
    )
  })
  
};

//MENU:  TIMEKEEPING --> checkout
exports.getCheckOut = (req, res) => {
  const companyId = req.params.companyId;
  Data.findOne({companyId: companyId}).then(data =>{
    Info.findOne({companyId: companyId}).then((staff)=>{
      res.render('timekeeping/checkOut', {
        pageTitle: 'Kết thúc làm',
        path: '/timekeeping',
        data: data,
        staff: staff,
        moment: moment
      })
    })
  }).catch(err => console.log(err))
};

exports.postCheckOut = (req, res) => {
  const timekeepingId = new ObjectId(req.body.timekeepingId);
  const date = moment(req.body.date).format('YYYY-MM-DD');
  const companyId = req.body.companyId;
  const status = "Không làm việc";
  const timeStart = req.body.timeStart;
  const timeEnd = moment().add(7, 'hours').format('HH:mm:ss');
  const workHours = moment.duration(moment(timeEnd, 'HH:mm:ss').diff( moment(timeStart, 'HH:mm:ss') )).asHours();
  //upload dữ liệu timeEnd
  Data.findOneAndUpdate(
    {companyId: companyId, "timekeeping._id": timekeepingId}, 
    {$set: 
      {
        "timekeeping.$.timeEnd": timeEnd,
        "timekeeping.$.workHours": workHours,
        confirmedStatus: false //chế độ cho phép admin confirm data
      }
    },
    {new: true},
    (err, doc)=>{
      // chuyển sang trạng thái 'đang làm việc' và load lại page checkout
      Info.findOneAndUpdate({companyId: companyId}, {$set: {status: status}}, {new: true}, (err, staff) => {
        res.render('timekeeping/checkOut', {
          pageTitle: 'Kết thúc làm',
          path: '/timekeeping',
          data: doc,
          staff: staff,
          moment: moment
        })
      })
    }
  )
  
};

//MENU:  TIMEKEEPING --> leave
exports.getLeave = (req, res) => {
  let message = req.flash('error');
  const companyId = req.params.companyId;
  if (message.length > 0) {message = message[0]} 
  else {message = null}
  Data.findOne({companyId: companyId}).then(data =>{
    Info.findOne({companyId: companyId}).then((staff)=>{
      return res.render('timekeeping/leave', {
        pageTitle: 'Nghỉ phép',
        path: '/timekeeping',
        data: data,
        staff: staff,
        moment: moment,
        errorMessage: message,
        oldInput: {
          startLeave: '',
          endLeave: '',
          leaveHours: '',
          reason: ''
        },
        validationErrors: []
      })
    })
  }).catch(err => console.log(err))
};

exports.postLeave = (req, res) => {
  const companyId = req.body.companyId;
  const startLeave = moment(req.body.startLeave).format("YYYY-MM-DD");
  const endLeave = moment(req.body.endLeave).format("YYYY-MM-DD");
  const leaveHours = req.body.leaveHours;
  const reason = req.body.reason;
  const remainingDays = req.body.remainingDays - ((new Date(endLeave).getTime() - new Date(startLeave).getTime())/86400000+1)*leaveHours/8;
  const errors = validationResult(req);
  //validate form
  if (!errors.isEmpty()) {
    return Data.findOne({companyId: companyId}).then(data =>{
      Info.findOne({companyId: companyId}).then((staff)=>{
        return res.render('timekeeping/leave', {
          pageTitle: 'Nghỉ phép',
          path: '/timekeeping',
          data: data,
          staff: staff,
          moment: moment,
          errorMessage: errors.array()[0].msg,
          oldInput: {
            startLeave: startLeave,
            endLeave: endLeave,
            leaveHours: leaveHours,
            reason: reason
          },
          validationErrors: errors.array()
        })
      })
    })
  }
  //cập nhật dữ liệu checkin trước đó với dữ liệu đăng kí nghỉ phép nếu có cùng ngày
  Data.findOne({companyId: companyId}).then(data => {
    for (item of data.timekeeping) {
      if (moment(item.date).format('YYYY-MM-DD') >= startLeave && moment(item.date).format('YYYY-MM-DD') <= endLeave) {
        Data.updateOne(
          {companyId: companyId, "timekeeping._id": item._id}, 
          {$inc: 
            {
              "timekeeping.$.leaveHours": leaveHours
            }
          }
        ).exec()
      }
    }
  })
  // upload dữ liệu nghỉ phép và load lại page nghỉ phép với dữ liệu vừa cập nhật
  Data.findOneAndUpdate(
    {companyId: companyId}, 
    {$push: 
      {leave:
        {
          startLeave: startLeave,
          endLeave: endLeave,
          leaveHours: leaveHours,
          reason: reason,
          remainingDays: remainingDays
        },
      $set:
        {
          confirmedStatus: false
        }  
      }
    },
    {new: true},
    (err, doc)=>{
      Info.findOne({companyId: companyId}).then((staff)=>{
        res.render('timekeeping/leave', {
          pageTitle: 'Nghỉ phép',
          path: '/timekeeping',
          data: doc,
          staff: staff,
          moment: moment,
          errorMessage: null,
          oldInput: {
            startLeave: '',
            endLeave: '',
            leaveHours: '',
            reason: ''
          },
          validationErrors: []
        })
      })
    }
  )
  
};