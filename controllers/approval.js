const Data = require('../models/data');
const Info = require('../models/info');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectId;

//MENU:  APPROVAL --> fetch staff
exports.getStaff = (req, res) =>{
  Info.find({'userAdmin._id': req.user._id})
    .then(staffs => {
      res.render('approval/approval', {
        pageTitle: 'Xác nhận giờ làm',
        path: '/approval',
        staffs: staffs,
        moment: moment
      })
    })
    .catch(err => {console.log(err)});
}
//MENU:  APPROVAL --> xem thong tin cham cong
exports.getInfo = (req, res) =>{
  const companyId = req.params.companyId;
  Info.findOne({companyId: companyId}).then((staff)=>{
    Data.findOne({companyId: companyId}).then((data)=>{
      const monthList = [... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('MM-YYYY')} ))];
      res.render('approval/getInfo', {
        pageTitle: 'Xác nhận giờ làm',
        path: '/approval',
        staff: staff,
        data: data,
        error: false,
        timekeepingId: null,
        moment: moment,
        userAdmin: staff.userAdmin, // chỉ cho phép confirm data đối với nhân viên của admin đang login
        monthList: monthList, // hiển thị chức năng chọn tháng
        monthOfYear: monthList[0] //hiển thi dữ liệu chấm công của tháng đầu tiên trong danh sách các tháng
      })
    })
  })
}
//MENU:  APPROVAL --> POST chọn tháng cần confirm data
exports.postMonth  = (req, res) => {
  const companyId = req.body.companyId;
  Info.findOne({companyId: companyId}).then((staff)=>{
    Data.findOneAndUpdate(
      {companyId: companyId}, 
      {$set: {confirmedStatus: false}}, //cho phép confirm data với tháng đã chọn
      {new: true},
      (err, data)=>{
        const monthList = [... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('MM-YYYY')} ))];
        res.render('approval/getInfo', {
          pageTitle: 'Xác nhận giờ làm',
          path: '/approval',
          staff: staff,
          data: data,
          error: false,
          timekeepingId: null,
          moment: moment,
          userAdmin: staff.userAdmin,// chỉ cho phép confirm data đối với nhân viên của admin đang login
          monthList: monthList,// hiển thị chức năng chọn tháng
          monthOfYear: req.body.monthOfYear //chỉ hiển thi dữ liệu chấm công của tháng được chọn
      })
    })
  })
}


//MENU:  APPROVAL --> GET confirm data
exports.confirmData = (req, res) => {
  const companyId = req.params.companyId;
  const monthOfYear = req.query.monthOfYear;
  Data.findOneAndUpdate(
    {companyId: companyId}, 
    {$set: 
      {confirmedStatus: true}  // chuyển sang trạng thái không thể thêm,sửa,xoá timeEnd
    },
    {new: true},
    (err, data) => {
      const dateList = [... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('YYYY-MM-DD')} ))];
      const monthList = [... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('MM-YYYY')} ))];
    
      // tạo dữ liệu timekkeepingPerDay
      let timekeepingPerDay = [];
      for (let date of dateList) {
        let workHoursPerDay = 0;
        let leaveHoursPerDay = 0;
        for (let item of data.timekeeping) {
          if (moment(item.date).format('YYYY-MM-DD') == date) {
            workHoursPerDay += item.workHours;
            leaveHoursPerDay = item.leaveHours;
          }
        };
        const checkTime = +workHoursPerDay + leaveHoursPerDay - 8
        timekeepingPerDay.push(
          {
            "date": date, 
            "monthOfYear": moment(date).format('MM-YYYY'),
            "workHoursPerDay": workHoursPerDay, 
            "leaveHoursPerDay": leaveHoursPerDay, 
            "overTime": checkTime > 0 ? checkTime : 0,
            "underTime": checkTime <0 ? Math.abs(checkTime): 0
          }
        );
      }
      let workHoursPerMonth = 0;
      for (let month of monthList) {
        for (let item of data.timekeeping) {
          if (item.monthOfYear == month) {
            workHoursPerMonth += item.workHours;
          }
        };
      }
      // Tạo dữ liệu salary của tháng dựa trên dữ liệu timekeepingPerDay vừa tạo được
      let salary = [];
      for (let month of monthList) {
        let totalOverTime = 0;
        let totalUnderTime = 0;
        for (let data of timekeepingPerDay) {
          if (data.monthOfYear == month) {
            totalOverTime += data.overTime;
            totalUnderTime += data.underTime;
          }
        };
        salary.push(
          {
            "monthOfYear": month, 
            "workHoursPerMonth": workHoursPerMonth,
            "totalOverTime": totalOverTime, 
            "totalUnderTime": totalUnderTime, 
            "salary": Math.ceil((parseFloat(data.salaryScale)*3000000 + (totalOverTime - totalUnderTime)*200000)/1000)*1000 ,
          }
        );
      };
      // upload timekeepingPerDay, salary và reload lại trang
      Data.findOneAndUpdate(
        {companyId: companyId}, 
        {$set: 
          {
            timekeepingPerDay: timekeepingPerDay, 
            salary: salary
          }
        },
        {new : true},
        (err, doc) => {
          Info.findOne({companyId: companyId}).then(staff => {
            res.render('approval/getInfo', {
              pageTitle: 'Xác nhận giờ làm',
              path: '/approval',
              staff: staff,
              data: doc,
              error: false,
              timekeepingId: null,
              moment: moment,
              userAdmin: staff.userAdmin,// chỉ cho phép confirm data đối với nhân viên của admin đang login
              monthList: monthList,// hiển thị chức năng chọn tháng
              monthOfYear: monthOfYear//chỉ hiển thi dữ liệu chấm công của tháng được chọn
            })
          })
        }
      );
    }
  )
  
}

exports.editData = (req, res) => {
  const timekeepingId = new ObjectId(req.body.timekeepingId);
  const date = req.body.date;
  // const staffId = req.body.staffId;
  const companyId = req.body.companyId;
  const timeStart = req.body.timeStart;
  const timeEnd = req.body.timeEnd;
  
  const newWorkHours = moment.duration(moment(timeEnd, 'HH:mm:ss').diff( moment(timeStart, 'HH:mm:ss') )).asHours();
  // Không cho phép timeEnd <= timeStart
  if(newWorkHours <= 0) {
    return Info.findOne({companyId: companyId}).then((staff)=>{
      Data.findOne({companyId: companyId}).then((data)=>{
        const monthList = [... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('MM-YYYY')} ))]; 
        res.render('approval/getInfo', {
          pageTitle: 'Xác nhận giờ làm',
          path: '/approval',
          staff: staff,
          data: data,
          error: true,
          timekeepingId: req.body.timekeepingId,
          moment: moment,
          mode: 'details',
          userAdmin: staff.userAdmin, // chỉ cho phép confirm data đối với nhân viên của admin đang login
          monthList: monthList, // hiển thị chức năng chọn tháng
          monthOfYear: moment(date).format('MM-YYYY'), //chỉ hiển thi dữ liệu chấm công của tháng vừa edit
        })
      })
    })
  }

  // cập nhật dữ liệu mới của lần chấm công này với _id nhận được trong hàng cần edit
  Data.findOneAndUpdate(
    {companyId: companyId, "timekeeping._id": timekeepingId}, 
    {$set: 
      {
        "timekeeping.$.timeEnd": timeEnd,
        "timekeeping.$.workHours": newWorkHours,
        confirmedStatus: false
      }
    }
  ).exec();
  //chuyển trạng thái sang không làm việc
  Info.findOneAndUpdate(
    {companyId: companyId}, 
    {$set: {status: "Không làm việc"}},
    {new: true},
    (err, staff) => {
      Data.findOne({companyId: companyId}).then((data)=>{
        const monthList = [... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('MM-YYYY')} ))]; 
        res.render('approval/getInfo', {
          pageTitle: 'Xác nhận giờ làm',
          path: '/approval',
          staff: staff,
          data: data,
          error: false,
          timekeepingId: null,
          moment: moment,
          mode: 'details',
          userAdmin: staff.userAdmin, // chỉ cho phép confirm data đối với nhân viên của admin đang login
          monthList: monthList, // hiển thị chức năng chọn tháng
          monthOfYear: moment(date).format('MM-YYYY'), //chỉ hiển thi dữ liệu chấm công của tháng vừa edit
        })
      })
    }
  )
}

exports.deleteData = (req, res) => {
  const timekeepingId = new ObjectId(req.body.timekeepingId);
  const date = req.body.date;
  const companyId = req.body.companyId;

  Data.findOneAndUpdate(
    {companyId: companyId, "timekeeping._id": timekeepingId}, 
    {$set: 
      {
        "timekeeping.$.timeEnd": null,
        "timekeeping.$.workHours": 0,
        confirmedStatus: false
      }
    }
  ).exec();
  //chuyển trạng thái sang đang làm việc
  Info.findOneAndUpdate(
    {companyId: companyId}, 
    {$set: {status: "Đang làm việc"}},
    {new: true},
    (err, staff) => {
      Data.findOne({companyId: companyId}).then((data)=>{
        const monthList = [... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('MM-YYYY')} ))]; 
        res.render('approval/getInfo', {
          pageTitle: 'Xác nhận giờ làm',
          path: '/approval',
          staff: staff,
          data: data,
          error: false,
          timekeepingId: null,
          moment: moment,
          mode: 'details',
          userAdmin: staff.userAdmin, // chỉ cho phép confirm data đối với nhân viên của admin đang login
          monthList: monthList, // hiển thị chức năng chọn tháng
          monthOfYear: moment(date).format('MM-YYYY'), //chỉ hiển thi dữ liệu chấm công của tháng vừa edit
        })
      })
    }
  )
}