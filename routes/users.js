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
        addNewUsers(req, res);
    }
    else {
        req.session.errors = errors;
        res.redirect('/users/register');
    }
});

module.exports = router;


function addNewUsers(req, res) {
    User.save({
        name: req.body.userName,
        firstname: req.body.userFirstname,
        email: req.body.userEmail,
        password: bcrypt.hashSync(req.body.userPassword, saltRounds)
    });
    res.redirect('/users');
}

function badUserError(req, res) {
    console.log("bad user");
    req.session.errors = "Utilisateur inconnu";
    res.redirect('/users');
}

function LogValidators(req) {
    let errors = [];
    if (!validator.isLength(req.body.userName, { min: 3, max: 100 })) errors.push("Le nom doit avoir 3 caractères minimum");
    if (!validator.isAlphanumeric(req.body.userName)) errors.push("Le nom doit contenir uniquement des caractères alphanumériques");
    if (!validator.isLength(req.body.userFirstname)) errors.push("Le prénom doit avoir 3 caractères minimum");
    // firstname : alphanumeric + '-'
    if (!validator.isAlphanumeric(req.body.userFirstname, "fr-FR", { ignore: '-' })) errors.push("Le prénom doit contenir uniquement des caractères alphanumériques");
    if (!validator.isEmail(req.body.userEmail)) errors.push("L'email entré n'est pas correct !");
    if (!validator.isStrongPassword(req.body.userPassword, { minLength: 2, minLowercase: 0, minUppercase: 0, minNumbers: 0, minSymbols: 0, returnScore: false })) errors.push("Le mot de passe n'et pas assez fort : 2 caractères minimum, ... !");
    if (req.body.userPassword != req.body.userPasswordConfirmation) errors.push("Les mot de passes ne correspondent pas");
    if (User.find(req.body.userEmail)) errors.push("Email/Utilisateur déjà présent en DB");
    return errors;
}

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
