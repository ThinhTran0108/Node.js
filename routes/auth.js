const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',
  [
    body('username', 'Please enter a valid username.').isString().isLength({ min: 3 }).trim(),
    body('password', 'Password has at least 1 character.').isLength({ min: 1 }).trim()
  ],
  authController.postLogin
);

router.post('/signup',
  [
    body('username', 'Please enter a valid username.')
      .isString()
      .custom((value, { req }) => {
        return User.findOne({ username: value }).then(userDoc => {
          if (userDoc) {return Promise.reject('Username exists already, please pick a different one.')}
        });
      })
      .isLength({ min: 3 })
      .trim(),
    body('password', 'Password has at least 1 character.').isLength({ min: 1 }).trim(),
    body('confirmPassword').trim().custom((value, { req }) => {
      if (value !== req.body.password) {throw new Error('Passwords have to match!')}
      return true;
    })
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

module.exports = router;
