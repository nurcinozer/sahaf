if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const expressSession = require('express-session')
const connectMongo = require('connect-mongo')

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')
const userRouter = require('./routes/users')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: false
}))

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('connected to mongoose'))

const MongoStore = connectMongo(expressSession)

app.use(expressSession({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

// display links middleware
app.use((req, res, next) => {
    const {userId} = req.session
    if(userId) {
        res.locals = {
            displayLink: true
        }
    } else {
        res.locals = {
            displayLink: false
        }
    }
    next()
})

app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)
app.use('/users', userRouter)

app.listen(process.env.PORT || 3000)