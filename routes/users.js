const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

router.get('/register', (req, res) => {
    res.render('users/register', {
        user: new User()
    })
})

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        var user = {
            email: req.body.email,
            password: hashedPassword
        }
        User.create(user, (error, user) => {
            res.redirect('/users/login')
        })
    } catch (error) {
        //res.redirect('/users/register')
        res.render('users/register', {
            user: user,
            errorMessage: 'You have to fill textfields'
        })
    }
})

router.get('/login', (req, res) => {
    res.render('users/login', {
        user: new User()
    })
})

router.post('/login', (req, res) => {
    const {
        email,
        password
    } = req.body

    User.findOne({
        email
    }, async (error, user) => {
        if (user == null) {
            //return res.status(400).send('Cannot find user')
            return res.render('users/login', {
                user: user,
                errorMessage: 'Cannot find user'
            })
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                req.session.userId = user._id
                res.redirect('/')
            } else {
                res.render('users/login', {
                    user: user,
                    errorMessage: 'Password is not correct'
                })
            }
        } catch {
            res.render('users/login', {
                user: user,
                errorMessage: 'Cannot find user, please register'
            })
        }
    })

})

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

module.exports = router