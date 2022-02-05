// /api
const express = require('express');
const { getUserbyId } = require('../db');
const router = express.Router();

// GET /api
// router.get('/', (req, res) => {
//     console.log("A get request is being made to /api");
//     res.send('<h1>This is the API page</h1>');
// });

// bring in jwt (authorization) 
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// authorization
router.use( async (req, res, next) => {
    const prefix = 'Bearer '
    const auth = req.header('Authorization');
    console.log('auth: ', auth)

    if (!auth) {
        next(); 
    } else if (auth.startsWith(prefix)) {
        const [ , token ] = auth.split(' ');
        try {
            const { id }  = jwt.verify(token, JWT_SECRET)
            console.log('id: ', id)
            if (id) { 
                const user = await getUserbyId(id);
                console.log(user)
                req.user = user;
                next() 
            } else {
                next();
            }
        } catch({name, message}) {
            next({name, message})
            console.log('name: ', name)
            console.log('message: ', message)
        }
    } else {
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${ prefix }`
        });
    }
});

router.use((req, res, next) => {
    if (req.user) {
        console.log("user is set: ", req.user)
    }
    next()
})

// routers
// const usersRouter = require('./users')
// router.use('/users', usersRouter)
router.use('/users', require('./users'))
router.use('/posts', require('./posts'))
router.use('/tags', require('./tags'))

// error handling
router.use(({ name, message }, req, res, next) => {
    res.send({
        name,
        message
    })
});

module.exports = router;

