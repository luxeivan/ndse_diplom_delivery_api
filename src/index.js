const express = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const session = require('express-session')
const verify = require('./middleware/verify')
const socketIO = require('socket.io');
const http = require('http')
const fs = require('fs')

const multer = require('multer')
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const today = new Date()
        const dir = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
        const multerDestination = `uploads/${dir}/`
        fs.mkdir(multerDestination, err => {
            console.log(err)
            if (err && err.code !== "EEXIST") return err
            cb(null, multerDestination);
        })
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})
console.log(LocalStrategy.Strategy)
const upload = multer({ storage: storage })

const mongoose = require("mongoose");
const serverMongo = process.env.SERVERMONGO || "mongodb://root:example@localhost:27017/";
const User = require('./model/user')
mongoose.connect(serverMongo);

const Advertisement = require('./model/advertisement')
// const users = require('./routers/users')

const PORT = process.env.port || 3000
const app = express()
const server = http.Server(app);
const io = socketIO(server);
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({secret: 'secret123'}));

// ------PASSPORT------------------------------------------------------------------------------------
// passport.use('local', new LocalStrategy({
//     usernameField: "email",
//     passwordField: "passwordHash",
// }, async (email, passwordHash, done) => {
//     const user = await User.findByEmail(email);
//     console.log('-----------------')
//     console.log(user)
//     console.log('-----------------')
//     if (!user) {
//       return done(null, false);
//     } else if (user.passwordHash !== password) {
//       return done(null, false);
//     } else {
//       return done(null, user)
//     }
//   }))


passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log('---------')
      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
      });
    }
  ));

passport.serializeUser((user, cb) => {
    console.log('serialize')
    cb(null, user._id)
})
passport.deserializeUser(async (id, cb) => {
    console.log('deserialize')
    try {
        const user = await User.find({ _id: id });
        cb(null, user)
    } catch (error) {
        if (err) { return cb(err) }
    }
})
function checkAuth() {
    return app.use((req, res, next) => {
        if (req.user) next()
        else res.redirect('/123')
    })
}

app.use(passport.initialize());
app.use(passport.session());
// ------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.json("main")
})
app.get('/user', (req, res) => {
    // res.json(req.query)
    User.findByEmail(req.query.email).then(user => {
        res.json(user)
    })
})
app.post('/api/signup', (req, res) => {
    const { email, passwordHash, name, contactPhone } = req.query
    User.create({ email, passwordHash, name, contactPhone, createdAt: new Date() }).then(newuser => {
        res.json(newuser)
    }).catch(err => {
        res.json(err)
    })
})
app.post('/api/signin', passport.authenticate('local', { failureRedirect: '/qwerty' }),
    function (req, res) {
        res.send('/');
    });
// ----------Advertisement-----------------
app.get('/api/advertisements', (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    next()
},
    async (req, res) => {
        res.json(await Advertisement.find({}).exec())
    })
app.get('/api/advertisements/:id', async (req, res) => {
    const id = req.params.id
    console.log(id)
    res.json(await Advertisement.findById(id).exec())
})
app.post('/api/advertisements', upload.array('images', 10), async (req, res) => {
    console.log(req.files)
    console.log(req.body)
    const { shortText, description } = req.body
    const images = []
    req.files.forEach(item => {
        images.push(item.destination + item.filename)
    })
    Advertisement.create({ shortText, description, images, createdAt: new Date() }).then(newAdvertisement => {
        res.json(newAdvertisement)
    }).catch(err => {
        res.json(err)
    })
})
// ----------Advertisement-----------------



server.listen(PORT)
console.log(`Server start on port ${PORT}`)
// shortText	string	да	нет
// description	string	нет	нет
// images	string[]	нет	нет
// userId	ObjectId	да	нет
// createdAt	Date	да	нет
// updatedAt	Date	да	нет
// tags	string[]	нет	нет
// isDeleted	boolean	да	нет