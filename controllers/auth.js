const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');


exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {message = message[0]} 
  else {message = null}
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Đăng nhập',
    errorMessage: message,
    oldInput: {
      username: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {message = message[0]} 
  else {message = null}
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Đăng ký',
    errorMessage: message,
    oldInput: {
      username: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Đăng nhập',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        username: username,
        password: password
      },
      validationErrors: errors.array()
    });
  }

  User.findOne({ username: username })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Đăng nhập',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            username: username,
            password: password
          },
          validationErrors: []
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.isAdmin = user.username.startsWith("admin");
            req.session.user = user;
            return req.session.save(err => {
              res.redirect(req.session.returnTo || '/');
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Đăng nhập',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              username: username,
              password: password
            },
            validationErrors: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => {console.log(err)});
};

exports.postSignup = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Đăng ký',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        username: username,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        username: username,
        password: hashedPassword
      });
      return user.save();
    })
    .then(result => {res.redirect('/login')})
    .catch(err => {console.log(err)});
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/login');
  });
};
