const express = require('express');
const router = express.Router();

const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const validator = require('validator');

/* form login / password */
router.get('/', (req, res, next) => {
    console.log("USERS INDEX");
    if (req.session.login) {
        res.redirect("/members");
    }
    res.render('users/index');
});

/* check login and password */
router.post('/login', (req, res, next) => {
    console.log("USERS LOGIN");
    // User in DB ? -> return the record of the user if found
    const userFound = User.find(req.body.userLogin);
    console.log("User found" + JSON.stringify(userFound));
    if (userFound) {
        if (userFound.active == false) {
            compteDesactive(req, res);
        }
        else {
            FunctioncheckPassword(req, userFound, res);
        }
    }
    else {
        badUserError(req, res);
    }
});

router.get('/logout', (req, res, next) => {
    console.log("USERS LOGOUT");
    req.session.destroy();
    res.redirect('/users');
});

router.get('/register', (req, res, next) => {
    console.log("USERS REGISTER");
    res.render('users/register', { errors: req.session.errors });
    req.session.errors = null;

});

router.post('/add', (req, res, next) => {
    console.log("USERS ADD");
    // validation 
    let errors = LogValidators(req);
    if (errors.length == 0) {
        User.save({
            name: req.body.userName,
            firstname: req.body.userFirstname,
            email: req.body.userEmail,
            password: bcrypt.hashSync(req.body.userPassword, saltRounds)
        });
        res.redirect('/users');
    }
    else {
        req.session.errors = errors;
        res.redirect('/users/register');
    }
});

module.exports = router;


function compteDesactive(req, res) {
    req.session.errors = "Compte désactivé";
    res.redirect('/users');

    
function FunctioncheckPassword(req, userFound, res) {
    if (bcrypt.compareSync(req.body.userPassword, userFound.password)) {
        console.log("password correct");
        req.session.login = req.body.userLogin;
        req.session.connected = true;
        if (userFound.admin) {
            req.session.admin = true;
            res.redirect('/admin');
        } else {
            req.session.admin = false;
            res.redirect('/members');
        }
    }
    else {
        console.log("bad password");
        req.session.errors = "Mot de passe incorrect";
        res.redirect('/users');
    }
}};
