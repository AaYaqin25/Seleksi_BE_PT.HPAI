var express = require('express');
var router = express.Router();
const models = require('../models/index.js');
const { Response, checkEmail } = require('../helpers/util.js');
const { hashSync, compareSync } = require('bcrypt');
const { encodeToken, decodeToken } = require('../helpers/jwt.js');
const { isLoggedIn } = require('../helpers/middleware.js');
const saltRounds = 10;

router.get('/users', isLoggedIn, async function (req, res, next) {
  try {
    const getUser = await models.User.findAll();
    res.status(200).json(new Response(getUser));
  } catch (error) {
    console.log(error);
    res.status(500).json(new Response(error, false));
  }
});

router.post('/users', isLoggedIn, async function (req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const checkEmailValid = checkEmail(email);
    if (!checkEmailValid) return res.status(401).json(new Response('Email must contain @gmail.com', false));
    const hashPassword = hashSync(password, saltRounds);
    const [user, created] = await models.User.findOrCreate({
      where: { email },
      defaults: { name, password: hashPassword, role }
    });

    if (!created) {
      return res.status(409).json(new Response('Email already exists', false));
    }

    return res.status(201).json(new Response(user));
  } catch (error) {
    console.log(error);
    res.status(500).json(new Response(error, false));
  }
});

router.get('/users/:id', isLoggedIn, async function (req, res, next) {
  try {
    const getOneUser = await models.User.findOne({
      where: {
        id: req.params.id
      }
    })
    res.status(200).json(new Response(getOneUser));
  } catch (error) {
    console.log(error);
    res.status(500).json(new Response(error, false));
  }
});

router.delete('/users/:id', isLoggedIn, async function (req, res, next) {
  try {
    const deleteUser = await models.User.destroy({
      where: {
        id: req.params.id
      }
    });
    res.status(200).json(new Response(deleteUser));
  } catch (error) {
    console.log(error);
    res.status(500).json(new Response(error, false));
  }
});

router.post('/login', async function (req, res, next) {
  try {
    const { email, password } = req.body;
    const checkEmailValid = checkEmail(email);
    if (!checkEmailValid) return res.status(401).json(new Response('Email must contain @gmail.com', false));

    const user = await models.User.findOne({
      where: {
        email: email
      }
    });
    //check Email exist
    if (!user || user.email !== email) return res.status(401).json(new Response('Email or password is wrong', false));
    // check Password
    const comparePassword = compareSync(password, user.password);
    if (!comparePassword) return res.status(401).json(new Response('Email or password is wrong', false));
    const token = encodeToken({ id: user.id, name: user.name });
    res.status(201).json(new Response({ id: user.id, name: user.name, token: token }));
  } catch (error) {
    console.log(error);
    res.status(500).json(new Response(error, false));
  }
});

router.get('/logout', isLoggedIn, async function (req, res, next) {
  try {
    const bearerToken = req.get('Authorization');
    const token = bearerToken?.split(' ')[1];
    if (!token) return res.status(401).json(new Response('Token not provided', false));
    const data = decodeToken(token);
    if (!data || !data.id) return res.status(401).json(new Response('User is not authorized', false));

    res.status(200).json(new Response('You was successful logout'));
  } catch (error) {
    console.log(error);
    res.status(500).json(new Response(error, false));
  }
});

module.exports = router;
