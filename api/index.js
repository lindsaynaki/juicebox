// /api
const express = require('express');
const { getUserbyId } = require('../db');
const router = express.Router();

// bring in jwt (authorization) 
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// authorization
router.use( async (req, res, next) => {
    const prefix = 'Bearer '
    const auth = req.headers['authorization'];

    if (!auth) {
        next(); 
    } else if (auth.startsWith(prefix)) {
        const [ , token ] = auth.split(' ');
        try {
            const { id } = jwt.verify(token, JWT_SECRET)
            console.log('id: ', id)
            const user = await getUserbyId(id);
            console.log(user)
            req.user = user;
        
        next();
        } catch(error) {
            throw error;
            // fix this later
        }
    }
})

router.get('/', (req, res) => {
    res.send("A request is being made to '/api'")
  })

// const usersRouter = require('./users')
// router.use('/users', usersRouter)
router.use('/users', require('./users'))
router.use('/posts', require('./posts'))
router.use('/tags', require('./tags'))

module.exports = router;

