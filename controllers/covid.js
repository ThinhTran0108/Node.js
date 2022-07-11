const Data = require('../models/data');
const Info = require('../models/info');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { validationResult } = require('express-validator');

//MENU:  COVID --> fetch staff
exports.getStaff = (req, res) =>{
  if (req.session.isAdmin) {
    return Info.find({'userAdmin._id': req.user._id})
      .then(staffs => {
        res.render('covid/covid', {
          pageTitle:'Thông tin COVID',
          path: '/covid',
          staffs: staffs,
          moment: moment
        })
      })
      .catch(err => {console.log(err)});
  }
  Info.findOne({companyId: req.user.username})
  .then(staff=>{res.render('covid/covid', {
    pageTitle: 'Thông tin COVID',
    path: '/covid',
    staff: staff,
    moment: moment
  })})
  .catch(err => {console.log(err)});
};

//MENU:  COVID --> body temperature
exports.getBodyTemperature = (req, res) => {
  let message = req.flash('error');
  const companyId = req.params.companyId;
  if (message.length > 0) {message = message[0]} 
  else {message = null}
  Data.findOne({companyId: companyId}).then(data =>{
    Info.findOne({companyId: companyId}).then((staff)=>{
      return res.render('covid/bodytemp', {
        pageTitle: 'Thông tin thân nhiệt',
        path: '/covid',
        data: data,
        staff: staff,
        moment: moment,
        errorMessage: message,
        oldInput: {
          temp: '',
          dateTemp: ''
        },
        validationErrors: []
      })
    })
  }).catch(err => console.log(err))
}
exports.postBodyTemperature = (req, res) => {
  // const staffId = req.body.staffId
  const companyId = req.body.companyId;
  const temp = req.body.temp;
  const dateTemp = req.body.dateTemp;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return Data.findOne({companyId: companyId}).then(data =>{
      Info.findOne({companyId: companyId}).then((staff)=>{
        return res.render('covid/bodytemp', {
          pageTitle: 'Thông tin thân nhiệt',
          path: '/covid',
          data: data,
          staff: staff,
          moment: moment,
          errorMessage: errors.array()[0].msg,
          oldInput: {
            temp: temp,
            dateTemp: dateTemp
          },
          validationErrors: errors.array()
        })
      })
    })
  }
  Data.findOneAndUpdate(
    {companyId: companyId}, 
    {$push: 
      {bodyTemp:
        {
          "dateTemp": dateTemp,
          "temp": temp
        }
      }
    },
    {new: true},
    (err, doc)=>{
      Info.findOne({companyId: companyId}).then((staff)=>{
        res.render('covid/bodytemp', {
          pageTitle: 'Thông tin thân nhiệt',
          path: '/covid',
          data: doc,
          staff: staff,
          moment: moment,
          errorMessage: null,
          oldInput: {
            temp: '',
            dateTemp: ''
          },
          validationErrors: []
        })
      })
    }
  )
};



//MENU:  COVID --> vaccine
exports.getVaccine = (req, res) => {
  const companyId = req.params.companyId;
  let message = req.flash('error');
  if (message.length > 0) {message = message[0]} 
  else {message = null}
  Data.findOne({companyId: companyId}).then(data =>{
    Info.findOne({companyId: companyId}).then((staff)=>{
      return res.render('covid/vaccine', {
        pageTitle: 'Thông tin tiêm vaccine',
        path: '/covid',
        data: data,
        staff: staff,
        moment: moment,
        errorMessage: message,
        validationErrors: []
      })
    })
  
  }).catch(err => console.log(err))
}
exports.postVaccine = (req, res) => {
  // const staffId = req.body.staffId
  const companyId = req.body.companyId;
  const dateVac_1 = req.body.dateVac_1;
  const vac_1 = req.body.vac_1;
  const dateVac_2 = req.body.dateVac_2;
  const vac_2 = req.body.vac_2;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return Data.findOne({companyId: companyId}).then(data =>{
      Info.findOne({companyId: companyId}).then((staff)=>{
        return res.render('covid/vaccine', {
          pageTitle: 'Thông tin tiêm vaccine',
          path: '/covid',
          data: data,
          staff: staff,
          moment: moment,
          errorMessage: errors.array()[0].msg,
          validationErrors: errors.array()
        })
      })
    })
  }
  Data.findOneAndUpdate(
    {companyId: companyId}, 
    {$set: 
      {vaccine:
        {
          dateVac_1: dateVac_1,
          vac_1: vac_1,
          dateVac_2: dateVac_2,
          vac_2: vac_2
        }
      }
    },
    {new: true},
    (err, doc)=>{
      Info.findOne({companyId: companyId}).then((staff)=>{
        res.render('covid/vaccine', {
          pageTitle: 'Thông tin tiêm vaccine',
          path: '/covid',
          data: doc,
          staff: staff,
          moment: moment,
          errorMessage: null,
          validationErrors: []
        })
      })
    }
  )
}; 




//MENU:  COVID --> positive
exports.getPositive = (req, res) => {
  const companyId = req.params.companyId
  let message = req.flash('error');
  if (message.length > 0) {message = message[0]} 
  else {message = null}
  Data.findOne({companyId: companyId}).then(data =>{
    Info.findOne({companyId: companyId}).then((staff)=>{
      return res.render('covid/positive', {
        pageTitle: 'Đăng kí dương tính COVID',
        path: '/covid',
        data: data,
        staff: staff,
        moment: moment,
        errorMessage: message,
        oldInput: {
          datePositive: '',
          treatmentPlace: '',
          treatmentTime: ''
        },
        validationErrors: []
      })
    })
  }).catch(err => console.log(err))
};
exports.postPositive = (req, res) => {
  // const staffId = req.body.staffId
  const companyId = req.body.companyId;
  const datePositive = req.body.datePositive;
  const treatmentPlace = req.body.treatmentPlace;
  const treatmentTime = req.body.treatmentTime;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return Data.findOne({companyId: companyId}).then(data =>{
      Info.findOne({companyId: companyId}).then((staff)=>{
        return res.render('covid/positive', {
          pageTitle: 'Đăng kí dương tính COVID',
          path: '/covid',
          data: data,
          staff: staff,
          moment: moment,
          errorMessage: errors.array()[0].msg,
          oldInput: {
            datePositive: datePositive,
            treatmentPlace: treatmentPlace,
            treatmentTime: treatmentTime
          },
          validationErrors: errors.array()
        })
      })
    })
  }
  Data.findOneAndUpdate(
    {companyId: companyId}, 
    {$push: 
      {positive:
        {
          datePositive: datePositive,
          treatmentPlace: treatmentPlace,
          treatmentTime: treatmentTime
        }
      }
    },
    {new: true},
    (err, doc)=>{
      Info.findOne({companyId: companyId}).then((staff)=>{
        res.render('covid/positive', {
          pageTitle: 'Đăng kí dương tính COVID',
          path: '/covid',
          data: doc,
          staff: staff,
          moment: moment,
          errorMessage: null,
          oldInput: {
            datePositive: '',
            treatmentPlace: '',
            treatmentTime: ''
          },
          validationErrors: []
        })
      })
    }
  )
};
//MENU:  COVID --> Xem thông tin tổng hợp của admin
exports.getCovidStaffs = (req, res) =>{
  Data.find({'userAdmin._id': req.user._id}).then(staffs => {
    res.render('covid/staffs', {
      pageTitle: 'Thông tin COVID',
      path: '/covid',
      staffs: staffs,
      moment: moment
    })
  })
  .catch(err => {console.log(err)});
}
//MENU:  COVID --> Download của admin
exports.getDownload = (req, res) =>{
  const companyId = req.params.companyId;
  Data.findOne({companyId: companyId}, (err, data) => {
    if (!data) {
      return console.log('Không tìm thấy dữ liệu của nhân viên.');
    }
    const fileName = 'COVIDInfo-' + companyId + '.pdf';
    const filePath = path.join('data', 'download', fileName);

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="' + fileName + '"'
    );
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.pipe(res);
    fontpath = path.join(path.dirname(require.main.filename),'fonts');
    pdfDoc.fontSize(26).font(path.join(fontpath, 'Times New Roman Bold.ttf')).text('THÔNG TIN COVID CÁ NHÂN', 50, 50, {align: 'center', lineGap: 5});
    pdfDoc.fontSize(14).font(path.join(fontpath, 'Times New Roman.ttf')).text('---------------', {align: 'center', lineGap: 20});
    pdfDoc.fontSize(20).font(path.join(fontpath, 'Times New Roman Bold.ttf')).text('I.  Thông tin nhân viên', {lineGap: 20});
    pdfDoc.fontSize(14).font(path.join(fontpath, 'Times New Roman.ttf')).text('*  Họ tên: ' + data.name, {indent: 20, lineGap: 10});
    pdfDoc.fontSize(14).font(path.join(fontpath, 'Times New Roman.ttf')).text('*  Mã nhân viên: ' + data.companyId, {indent: 20, lineGap: 20});
    pdfDoc.fontSize(20).font(path.join(fontpath, 'Times New Roman Bold.ttf')).text('II.  Thông tin thân nhiệt', {lineGap: 20});
    if (data.bodyTemp.length > 0) {
      for (item of data.bodyTemp) {
        pdfDoc.fontSize(14).font(path.join(fontpath, 'Times New Roman.ttf')).text('*  Ngày đo: ' + moment(item.dateTemp).format('DD-MM-YYYY') + ' - ' + item.temp + ' độ C', {indent: 20, lineGap: 10});
      }
    } else {
      pdfDoc.fontSize(14).font(path.join(fontpath, 'Times New Roman.ttf')).text('*  Chưa có dữ liệu thân nhiệt', {indent: 20, lineGap: 10});
    }
    
    pdfDoc.fontSize(20).text(' ', {lineGap: 10});
    pdfDoc.fontSize(20).font(path.join(fontpath, 'Times New Roman Bold.ttf')).text('III.  Thông tin Vaccine', {lineGap: 20});
    if (data.vaccine.dateVac_1) {
      pdfDoc.fontSize(14).font(path.join(fontpath, 'Times New Roman.ttf')).text('*  Mũi 1: ' + moment(data.vaccine.dateVac_1).format('DD-MM-YYYY') + ' - Vaccine: ' + data.vaccine.vac_1, {indent: 20, lineGap: 10});
    } else {
      pdfDoc.fontSize(14).font(path.join(fontpath, 'Times New Roman.ttf')).text('*  Mũi 1: chưa có dữ liệu', {indent: 20, lineGap: 10});
    }
    if (data.vaccine.dateVac_2) {
      pdfDoc.fontSize(14).font(path.join(fontpath, 'Times New Roman.ttf')).text('*  Mũi 2: ' + moment(data.vaccine.dateVac_2).format('DD-MM-YYYY') + ' - Vaccine: ' + data.vaccine.vac_2, {indent: 20, lineGap: 10});
    } else {
      pdfDoc.fontSize(14).font(path.join(fontpath, 'Times New Roman.ttf')).text('*  Mũi 2: chưa có dữ liệu', {indent: 20, lineGap: 10});
    }
    
    pdfDoc.fontSize(14).text(' ', {lineGap: 10});
    pdfDoc.fontSize(20).font(path.join(fontpath, 'Times New Roman Bold.ttf')).text('IV.  Đăng ký dương tính với COVID', {lineGap: 20});
    if (data.positive.length > 0) {
      for (item of data.positive) {
        pdfDoc.fontSize(14).font(path.join(fontpath, 'Times New Roman.ttf')).text('*  Ngày dương tính: ' + moment(item.datePositive).format('DD-MM-YYYY') + ' - Điều trị tại: ' + item.treatmentPlace + ' - Thời gian điều trị: ' + item.treatmentTime + ' ngày', {indent: 20, lineGap: 10});
      }
    } else {
      pdfDoc.fontSize(14).font(path.join(fontpath, 'Times New Roman.ttf')).text('*  Chưa có dữ liệu dương tính với COVID', {indent: 20, lineGap: 10});
    }
    
    pdfDoc.fontSize(14).text(' ', {lineGap: 10});
    pdfDoc.fontSize(10).font(path.join(fontpath, 'Times New Roman Italic.ttf')).text('Ngày cập nhật: ' + moment().format('DD-MM-YYYY hh:mm:ss'), {align: 'right', lineGap: 10});

    pdfDoc.end();
  })
    
}