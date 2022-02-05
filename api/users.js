// /api/users

const express = require('express');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser, getUserbyId, updateUser } = require('../db');
const { requireUser } = require('./utils')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env;


usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");
    next();
  });

// GET '/api/users'
usersRouter.get('/', async (req, res) => { 
  console.log("getting all users");
  const users = await getAllUsers();
  res.send({
    users
  });
})

// POST '/api/users/login
usersRouter.post('/login', async (req, res, next) => {
  const {username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }
  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign(user, JWT_SECRET)
      console.log('token: ', token)
      res.send({token, message: "you're logged in!"});
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect"
      })
    }
  } catch(error) {
    console.log(error);
    next(error)
  }
});

// POST '/api/users/register'
usersRouter.post('/register', async(req, res, next) => {
  const {username, password, name, location } = req.body;

  try {
    const userExists = await getUserByUsername(username);
  
    // check if user already exists
    if (userExists) {
      next({
        mame: 'UserExistsError',
        message: 'A user by that username already exists'
      })
    }
    const user = await createUser({
      username, 
      password,
      name,
      location
    })
    const token = jwt.sign({
      id: user.id,
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    })
    res.send({
      message: 'thank you for signing up',
      token
    })
  } catch ({ name, message }) {
    next({ name, message })
  }
});

// PATCH '/api/users/:userId'
usersRouter.patch('/:userId', requireUser, async (req, res, next) => {
  const { userId } = req.params

  try {
    const user = await getUserbyId(userId)

    if (!user) {
      next({
        name: "UserNotFound",
        message: "The user does not exist"
      })
    } else if (req.user.id !== user.id) {
        next({
          name: "UnauthorizedUserError",
          message: "Unauthorized user, you cannot deactivate another user"
        })
    } else {
      const updatedUser = await updateUser(userId, {active: true})
      res.send({user: updatedUser})
    } 
  } catch ({name, message} ) {
    next({name, message})
  }
})

// DELETE '/api/users/:userId'
usersRouter.delete('/:userId', requireUser, async (req, res, next) => {
  const { userId } = req.params

  try {
    const user = await getUserbyId(userId)

    if (!user) {
      next({
        name: "UserNotFound",
        message: "The user does not exist"
      })
    } else if (req.user.id !== user.id) {
        next({
          name: "UnauthorizedUserError",
          message: "Unauthorized user, you cannot deactivate another user"
        })
    } else {
      const updatedUser = await updateUser(userId, {active: false})
      res.send({user: updatedUser})
    } 
  } catch ({name, message} ) {
    next({name, message})
  }
})

module.exports = usersRouter;