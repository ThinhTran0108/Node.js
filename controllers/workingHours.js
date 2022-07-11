const Data = require('../models/data');
const Info = require('../models/info');
const moment = require('moment');


//MENU:  WORKINGHOURS --> fetch staff
exports.getStaff = (req, res) =>{
  if (req.session.isAdmin) {
    return Info.find({'userAdmin._id': req.user._id})
      .then(staffs => {
        res.render('workingHours/workingHours', {
          pageTitle:'Tra cứu giờ làm',
          path: '/workinghours',
          staffs: staffs,
          moment: moment
        })
      })
      .catch(err => {console.log(err)});
  }
  Info.find({companyId: req.user.username})
  .then(staffs=>{res.render('workingHours/workingHours', {
    pageTitle: 'Tra cứu giờ làm',
    path: '/workinghours',
    staffs: staffs,
    moment: moment
  })})
  .catch(err => {console.log(err)});
}

//MENU:  WORKINGHOURS --> GET Details
exports.getDetails = (req, res) =>{
  const page = +req.query.page || 1;
  const companyId = req.params.companyId;
  const ITEMS_PER_PAGE = +req.query.numberOfRow; 
  const sortType = req.query.sort;

  Data.findOne({companyId: companyId})
    .then(data => { 
      totalItems = data.timekeeping.length;
      return totalItems;
    }).then(totalItems =>{
      Data.findOne({companyId: companyId}, (err, data) => {
        monthList = ([... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('MM-YYYY')} ))]);

        Data.aggregate([
          {$match: {companyId: companyId}},
          {$unwind: '$timekeeping'},
          {$sort: sortType == 'ngày' ? {'timekeeping.date': 1} : {'timekeeping.workplace': 1}},
          {$skip: ((page -1) * ITEMS_PER_PAGE)},
          {$limit: ITEMS_PER_PAGE},
          {$project: {_id: 0, 'date': '$timekeeping.date', 'monthOfYear': '$timekeeping.monthOfYear', 'workplace': '$timekeeping.workplace', 'timeStart': '$timekeeping.timeStart', 'timeEnd': '$timekeeping.timeEnd', 'workHours': '$timekeeping.workHours', 'leaveHours': '$timekeeping.leaveHours'}}
        ])
        .then(details=>{
          Info.findOne({companyId: companyId}).then(staff=>{
            res.render('workingHours/details', {
              pageTitle: 'Tra cứu giờ làm',
              path: '/workinghours',
              currentPage: page,
              hasNextPage: ITEMS_PER_PAGE * page < totalItems,
              hasPreviousPage: page > 1,
              nextPage: page + 1,
              previousPage: page - 1,
              lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
              staff: staff,
              confirmedStatus: data.confirmedStatus,
              details: details,
              moment: moment,
              searchError: false,
              userAdmin: staff.userAdmin,
              monthOfYear: monthList[0],
              numberOfRow: ITEMS_PER_PAGE,
              sort: sortType
            })
          })
        })
    });
  });  
}

//MENU:  WORKINGHOURS --> POST numberOfRow and POST sortType
exports.postDetails = (req, res) =>{
  const page = +req.query.page || 1;
  const companyId = req.body.companyId;
  const ITEMS_PER_PAGE = +req.body.numberOfRow || 10;
  const sortType = req.body.sort || 'ngày';


  Data.findOne({companyId: companyId})
    .then(data => { 
      totalItems = data.timekeeping.length;
      return totalItems;
    }).then(totalItems =>{
      Data.findOne({companyId: companyId}, (err, data) => {
        monthList = ([... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('MM-YYYY')} ))]);

        Data.aggregate([
          {$match: {companyId: companyId}},
          {$unwind: '$timekeeping'},
          {$sort: sortType == 'ngày' ? {'timekeeping.date': 1} : {'timekeeping.workplace': 1}},
          {$skip: ((page -1) * ITEMS_PER_PAGE)},
          {$limit: ITEMS_PER_PAGE},
          {$project: {_id: 0, 'date': '$timekeeping.date', 'monthOfYear': '$timekeeping.monthOfYear', 'workplace': '$timekeeping.workplace', 'timeStart': '$timekeeping.timeStart', 'timeEnd': '$timekeeping.timeEnd', 'workHours': '$timekeeping.workHours', 'leaveHours': '$timekeeping.leaveHours'}}
        ])
        .then(details=>{
          Info.findOne({companyId: companyId}).then(staff=>{
            res.render('workingHours/details', {
              pageTitle: 'Tra cứu giờ làm',
              path: '/workinghours',
              currentPage: page,
              hasNextPage: ITEMS_PER_PAGE * page < totalItems,
              hasPreviousPage: page > 1,
              nextPage: page + 1,
              previousPage: page - 1,
              lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
              staff: staff,
              confirmedStatus: data.confirmedStatus,
              details: details,    //hiển thị dữ liệu cho route có phân trang
              moment: moment,
              searchError: false,
              userAdmin: staff.userAdmin,
              monthOfYear: monthList[0], 
              numberOfRow: ITEMS_PER_PAGE,
              sort: sortType
            })
          })
        })
    });
  });  
}

//MENU:  WORKINGHOURS --> GET Summary
exports.getSummary = (req, res) =>{
  const page = +req.query.page || 1;
  const companyId = req.params.companyId;
  const ITEMS_PER_PAGE = +req.query.numberOfRow || 10; 

  Data.findOne({companyId: companyId})
    .then(data => { 
      totalItems = data.timekeepingPerDay.length;
      return totalItems;
    }).then(totalItems =>{
      Data.findOne({companyId: companyId}, (err, data) => {
        monthList = ([... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('MM-YYYY')} ))]);

        Data.aggregate([
          {$match: {companyId: companyId}},
          {$unwind: '$timekeepingPerDay'},
          {$sort: {'timekeepingPerDay.date': 1}},
          {$skip: ((page -1) * ITEMS_PER_PAGE)},
          {$limit: ITEMS_PER_PAGE},
          {$project: {_id: 0, 'date': '$timekeepingPerDay.date', 'monthOfYear': '$timekeepingPerDay.monthOfYear', 'workHoursPerDay': '$timekeepingPerDay.workHoursPerDay', 'leaveHoursPerDay': '$timekeepingPerDay.leaveHoursPerDay', 'overTime': '$timekeepingPerDay.overTime', 'underTime': '$timekeepingPerDay.underTime'}}
        ])
        .then(summary=>{
          Info.findOne({companyId: companyId}).then(staff=>{
            res.render('workingHours/summary', {
              pageTitle: 'Tổng kết theo ngày',
              path: '/workinghours',
              currentPage: page,
              hasNextPage: ITEMS_PER_PAGE * page < totalItems,
              hasPreviousPage: page > 1,
              nextPage: page + 1,
              previousPage: page - 1,
              lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
              staff: staff,
              confirmedStatus: data.confirmedStatus,
              summary: summary,
              moment: moment,
              searchError: false,
              userAdmin: staff.userAdmin,
              monthOfYear: monthList[0],
              numberOfRow: ITEMS_PER_PAGE
            })
          })
        })
    });
  });  
}

//MENU:  WORKINGHOURS --> POST numberOfRow
exports.postSummary = (req, res) =>{
  const page = +req.query.page || 1;
  const companyId = req.body.companyId;
  const ITEMS_PER_PAGE = +req.body.numberOfRow


  Data.findOne({companyId: companyId})
    .then(data => { 
      totalItems = data.timekeepingPerDay.length;
      return totalItems;
    }).then(totalItems =>{
      Data.findOne({companyId: companyId}, (err, data) => {
        monthList = ([... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('MM-YYYY')} ))]);

        Data.aggregate([
          {$match: {companyId: companyId}},
          {$unwind: '$timekeepingPerDay'},
          {$sort: {'timekeepingPerDay.date': 1}},
          {$skip: ((page -1) * ITEMS_PER_PAGE)},
          {$limit: ITEMS_PER_PAGE},
          {$project: {_id: 0, 'date': '$timekeepingPerDay.date', 'monthOfYear': '$timekeepingPerDay.monthOfYear', 'workHoursPerDay': '$timekeepingPerDay.workHoursPerDay', 'leaveHoursPerDay': '$timekeepingPerDay.leaveHoursPerDay', 'overTime': '$timekeepingPerDay.overTime', 'underTime': '$timekeepingPerDay.underTime'}}
        ])
        .then(summary=>{
          Info.findOne({companyId: companyId}).then(staff=>{
            res.render('workingHours/summary', {
              pageTitle: 'Tổng kết theo ngày',
              path: '/workinghours',
              currentPage: page,
              hasNextPage: ITEMS_PER_PAGE * page < totalItems,
              hasPreviousPage: page > 1,
              nextPage: page + 1,
              previousPage: page - 1,
              lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
              staff: staff,
              confirmedStatus: data.confirmedStatus,
              summary: summary,
              moment: moment,
              searchError: false,
              userAdmin: staff.userAdmin,
              monthOfYear: monthList[0], 
              numberOfRow: ITEMS_PER_PAGE
            })
          })
        })
    });
  });  
}

//MENU:  WORKINGHOURS --> GET Salary
exports.getSalary = (req, res) =>{
  const companyId = req.params.companyId;

  Data.findOne({companyId: companyId}, (err, data) => {
    monthList = ([... new Set (data.timekeeping.map( (item) => {return moment(item.date).format('MM-YYYY')} ))]);

    Data.aggregate([
      {$match: {companyId: companyId}},
      {$unwind: '$salary'},
      {$project: {_id: 0, 'monthOfYear': '$salary.monthOfYear', 'workHoursPerMonth': '$salary.workHoursPerMonth', 'totalOverTime': '$salary.totalOverTime', 'totalUnderTime': '$salary.totalUnderTime', 'salary': '$salary.salary'}}
    ])
    .then(salary=>{
      Info.findOne({companyId: companyId}).then(staff=>{
        res.render('workingHours/salary', {
          pageTitle: 'Lương tháng',
          path: '/workinghours',
          staff: staff,
          confirmedStatus: data.confirmedStatus,
          salary: salary,
          moment: moment,
          searchError: false,
          userAdmin: staff.userAdmin,
          monthList: monthList,   // hiển thị chức năng chọn tháng
          monthOfYear: monthList[0]
        })
      })
    })
  }); 
}
//MENU:  WORKINGHOURS --> POST monthOfYear
exports.postSalary = (req, res) =>{
  const companyId = req.body.companyId;
  const monthOfYear = req.body.monthOfYear;
  Data.findOne({companyId: companyId}, (err, data) => {
    Data.aggregate([
      {$match: {companyId: companyId}},
      {$unwind: '$salary'},
      {$project: {_id: 0, 'monthOfYear': '$salary.monthOfYear', 'workHoursPerMonth': '$salary.workHoursPerMonth', 'totalOverTime': '$salary.totalOverTime', 'totalUnderTime': '$salary.totalUnderTime', 'salary': '$salary.salary'}}
    ])
    .then(salary=>{
      Info.findOne({companyId: companyId}).then(staff=>{
        res.render('workingHours/salary', {
          pageTitle: 'Lương tháng',
          path: '/workinghours',
          staff: staff,
          confirmedStatus: data.confirmedStatus,
          salary: salary,
          moment: moment,
          searchError: false,
          userAdmin: staff.userAdmin,
          monthOfYear: monthOfYear
        })
      })
    })
  })
}


//MENU:  WORKINGHOURS --> GET Search
exports.getSearch = (req, res) =>{
  const companyId = req.params.companyId;
    Info.findOne({companyId: companyId}).then(staff=>{
      res.render('workingHours/search', {
        pageTitle: 'Tìm kiếm',
        path: '/workinghours',
        staff: staff,
        confirmedStatus: true,
        moment: moment,
        mode: null,
        error: false,
        errorMessage: null,
        oldInput: ''
      })
    })

}
//MENU:  WORKINGHOURS --> POST Search
exports.postSearch = (req, res) => {
  const companyId = req.body.companyId;
  let keywordList = {mode: null, workplace: null, date: null, month: null};
  let keywords = req.body.keywords.trim().split('&');
  // Nếu không có &
  if (!keywords[0]) {
    let item = keywords.trim().split('=');
    // Nếu không có =
    if (item[0]) {return Info.findOne({companyId: companyId}).then(staff=>{
      res.render('workingHours/search', {
        pageTitle: 'Tìm kiếm',
        path: '/workinghours',
        staff: staff,
        confirmedStatus: true,
        moment: moment,
        mode: null,
        error: true,
        errorMessage: `Nhập sai cú pháp ${item}. Vui lòng xem hướng dẫn!`,
        oldInput: req.body.keywords
      })
    })}
    // Nếu có = tức là có key1=value1...
    if (item[0].trim().toLowerCase() == 'mode') {keywordList.mode = item[1]}
    if (item[0].trim().toLowerCase() == 'workplace') {keywordList.workplace = item[1]}
    if (item[0].trim().toLowerCase() == 'date') {keywordList.date = item[1]}
    if (item[0].trim().toLowerCase() == 'month') {keywordList.month = item[1]}
  }
  // Nếu có &
  else {
    for (let keyword of keywords) {
      let item = keyword.trim().split('=');
      // Nếu không có =
      if (!item[0]) {return Info.findOne({companyId: companyId}).then(staff=>{
        res.render('workingHours/search', {
          pageTitle: 'Tìm kiếm',
          path: '/workinghours',
          staff: staff,
          confirmedStatus: true,
          moment: moment,
          mode: null,
          error: true,
          errorMessage: `Nhập sai cú pháp ${item}. Vui lòng xem hướng dẫn!`,
          oldInput: req.body.keywords
        })
      })}
      // Nếu có = tức là có key1=value1...
      if (item[0].trim().toLowerCase() == 'mode') {keywordList.mode = item[1]}
      if (item[0].trim().toLowerCase() == 'workplace') {keywordList.workplace = item[1]}
      if (item[0].trim().toLowerCase() == 'date') {keywordList.date = item[1]}
      if (item[0].trim().toLowerCase() == 'month') {keywordList.month = item[1]}
    }
  }
  // nếu không nhập mode hoặc nhập đồng thời ngày và tháng
  if (!keywordList.mode || (keywordList.date && keywordList.month)) {
    return Info.findOne({companyId: companyId}).then(staff=>{
      res.render('workingHours/search', {
        pageTitle: 'Tìm kiếm',
        path: '/workinghours',
        confirmedStatus: true,
        staff: staff,
        moment: moment,
        mode: null,
        error: true,
        errorMessage: keywordList.mode ? 'Không nhập keywords month và date đồng thời!' : 'Keywords không có chế độ tìm kiếm!',
        oldInput: req.body.keywords
      })
    })
  }
  // nếu có nhập mode=salary
  if (keywordList.mode == 'salary') {
  Data.findOne({companyId: companyId}, (err, data) => {
    Data.aggregate([
      {$match: {companyId: companyId}},
      {$unwind: '$salary'},
      {$sort: {'salary.monthOfYear': 1}},
      {$project: {_id: 0, 'monthOfYear': '$salary.monthOfYear', 'workHoursPerMonth': '$salary.workHoursPerMonth', 'totalOverTime': '$salary.totalOverTime', 'totalUnderTime': '$salary.totalUnderTime', 'salary': '$salary.salary'}}
    ])
    .then(salary=>{
      Info.findOne({companyId: companyId}).then(staff=>{
        res.render('workingHours/search', {
          pageTitle: 'Lương tháng',
          path: '/workinghours',
          staff: staff,
          confirmedStatus: data.confirmedStatus,
          salary: salary,
          moment: moment,
          mode: 'salary',
          error: false,
          errorMessage: null,
          oldInput: req.body.keywords,
          month: keywordList.month,
          keywords: req.body.keywords
        })
      })
    })
  })
    
  }

  // nếu có nhập mode = details
  if (keywordList.mode == 'details') {
    const sortType = req.body.sort || 'ngày';
    Data.findOne({companyId: companyId}, (err, data) => {
      Data.aggregate([
        {$match: {companyId: companyId}},
        {$unwind: '$timekeeping'},
        {$sort: sortType == 'ngày' ? {'timekeeping.date': 1} : {'timekeeping.workplace': 1}},
        {$project: {_id: 0, 'date': '$timekeeping.date', 'monthOfYear': '$timekeeping.monthOfYear', 'workplace': '$timekeeping.workplace', 'timeStart': '$timekeeping.timeStart', 'timeEnd': '$timekeeping.timeEnd', 'workHours': '$timekeeping.workHours', 'leaveHours': '$timekeeping.leaveHours'}}
      ])
      .then(details=>{
        Info.findOne({companyId: companyId}).then(staff=>{
          res.render('workingHours/search', {
            pageTitle: 'Tìm kiếm',
            path: '/workinghours',
            staff: staff,
            confirmedStatus: true,
            details: details,    //hiển thị dữ liệu cho route có phân trang
            moment: moment,
            mode: 'details',
            error: false,
            errorMessage: null,
            oldInput: req.body.keywords,
            sort: sortType,
            date: keywordList.date,
            month: keywordList.month,
            workplace: keywordList.workplace,
            keywords: req.body.keywords
          })
        })
      })
    })
    
  }

  // nếu có nhập mode = summary
  if (keywordList.mode == 'summary') {
    const sortType = req.body.sort || 'ngày';
    Data.findOne({companyId: companyId}, (err, data) => {
      Data.aggregate([
        {$match: {companyId: companyId}},
        {$unwind: '$timekeepingPerDay'},
        {$sort: {'timekeepingPerDay.date': 1}},
        {$project: {_id: 0, 'date': '$timekeepingPerDay.date', 'monthOfYear': '$timekeepingPerDay.monthOfYear', 'workHoursPerDay': '$timekeepingPerDay.workHoursPerDay', 'leaveHoursPerDay': '$timekeepingPerDay.leaveHoursPerDay', 'overTime': '$timekeepingPerDay.overTime', 'underTime': '$timekeepingPerDay.underTime'}}
      ])
      .then(summary=>{
        Info.findOne({companyId: companyId}).then(staff=>{
          res.render('workingHours/search', {
            pageTitle: 'Tìm kiếm',
            path: '/workinghours',
            staff: staff,
            confirmedStatus: data.confirmedStatus,
            summary: summary,
            moment: moment,
            mode: 'summary',
            error: false,
            errorMessage: null,
            oldInput: req.body.keywords,
            sort: sortType,
            date: keywordList.date,
            month: keywordList.month,
            keywords: req.body.keywords
          })
        })
      })
    })
    
  }
}