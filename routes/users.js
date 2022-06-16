const express = require('express');
const router = express.Router();
const catchAsync = require('../tools/catchAsync')
const User = require('../models/user');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.flash('success', 'Welcome');
        res.redirect('/taplist');
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back')
    res.redirect('/taplist')
});

module.exports = router;