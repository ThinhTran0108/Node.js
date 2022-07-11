
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const multer = require('multer');

const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://thinhtran:pass123@cluster0.njciaw0.mongodb.net/staff';


const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// Lưu avatar tải lên ở path: /images
const fileStorage = multer.diskStorage({
  destination: (req, file, cb)=>{cb(null, 'images')},
  filename: (req, file, cb) => {cb(null, new Date().toISOString() + '-' + file.originalname)}
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
    ) {cb(null, true);}
  else {cb(null, false);}
}

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;        // Sử dụng isAuthenticated để ẩn hiện Login/logout trong navigation.ejs
  res.locals.isAdmin = req.session.isAdmin;                   // Sử dụng isAdmin trong các file ejs: true là tài khoản admin được phép chỉnh sửa
  res.locals.user = req.session.user;                         // Sử dụng user để truy cập username hiển thị tên tài khoản đăng nhập trên navigation
  next();
});
app.use((req, res, next) => {
  if (!req.session.user) {return next()}
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {return next()}
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
    });
});

//routes
const staffInfoRoutes = require('./routes/info');
const timekeepingRoutes = require('./routes/timekeeping');
const workingHoursRoutes = require('./routes/workingHours');
const covidRoutes = require('./routes/covid');
const approvalRoutes = require('./routes/approval');
const authRoutes = require('./routes/auth');

app.use(staffInfoRoutes);                         // Routes thông tin nhân viên gồm: xem, sửa, xoá thông tin
app.use('/timekeeping', timekeepingRoutes);       // Routes chấm công gồm: điểm danh, kết thúc làm, nghỉ phép
app.use('/workinghours',workingHoursRoutes);      // Routes thông tin nhân viên gồm: xem giờ làm, lương
app.use('/covid',covidRoutes);                    // Routes covid gồm: thân nhiệt, vaccin, dương tính
app.use('/approval',approvalRoutes);              // Routes xác nhận thời gian làm việc của admin
app.use(authRoutes);                              // Routes login, logout, signup


//middleware for 500 page, 404 page and catch error when loading database
app.get('/500', ((req, res, next) => {res.status(500).render('500', {pageTitle: 'Error!', path: '/500', isAuthenticated: req.session.isLoggedIn})
}));
app.use((req, res) => {res.status(404).render('404', {pageTitle: 'Page Not Found!', path: '/404', isAuthenticated: req.session.isLoggedIn})
});


mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(process.env.PORT || 3000, '0.0.0.0', ()=>{console.log('Server is running!')});
  })
  .catch(err => {
    console.log(err);
  });

