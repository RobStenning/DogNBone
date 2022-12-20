if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const catchAsync = require('./tools/catchAsync');
const { isLoggedIn } = require('./tools/middleware');
const ExpressError = require('./tools/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Beer = require('./models/beers');
const beerRoutes = require('./routes/beers');
const userRoute = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const db = mongoose.connection;
const axios = require('axios');
const beers = require('./models/beers');
const res = require('express/lib/response');
const { updateMany } = require('./models/user');


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/dog-and-bone';
//const dbUrl = process.env.DB_URL || 'mongodb://mongo:27017/dog-and-bone';
mongoose.connect(dbUrl);

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use('/styles', express.static(__dirname + '/styles'));
app.use(express.static('public'));
app.use('/public', express.static(__dirname + '/public'));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'TheSecret';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600
});

store.on('error', function (e) {
    console.log('Session store error', e)
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 ^ 24 * 7,
        maxAge: 1000 * 60 * 60 ^ 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.deleted = req.flash('deleted');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoute);

app.get('/', async (req, res) => {
    const beers = await Beer.find({});
    const displayOntap = await Beer.findOne({ ontap: 'pouring'});
    res.render('home', { beers, displayOntap });
})

app.get('/taplist', catchAsync(async (req, res, next) => {
    const beers = await Beer.find({})
    const displayOntap = await Beer.findOne({ ontap: 'pouring'});
    const displayIncoming = await Beer.findOne({ ontap: 'kegged'});
    const displayBottled = await Beer.findOne({ ontap: 'bottled'});
    const displayPrevious = await Beer.findOne({ ontap: 'previous'});
    res.render('beers/taplist', { beers, displayOntap, displayIncoming, displayBottled, displayPrevious });
}))

app.get('/previousbeers', catchAsync(async (req, res, next) => {
    const beers = await Beer.find({})
    const displayPrevious = await Beer.findOne({ ontap: 'previous'});
    res.render('beers/previousbeers', { beers, displayPrevious});
}))

app.get('/new', isLoggedIn, (req, res) => {
    res.render('beers/new');
})

app.use('/beers', beerRoutes)

app.get('/robtoberfest', (req, res) =>{
    res.render('robtoberfest');
})


const username = process.env.brewFatherUName;
const password = process.env.brewFatherPassword;
let token = `${username}:${password}`;
let encoded = Buffer.from(token).toString('base64');

async function updateData() {
    console.log('start')
    //for(let i=0; i<5; i++){
    //const beer = await Beer.findOne({}, {name: 1})
    //console.log(beer.name)
    //}
    //const beer = await Beer.updateMany({}, { yeast: "updated"})
    //await beer.save()
    
    await axios({
        method: 'get',
        url: 'https://api.brewfather.app/v1/recipes/',
        headers: { 'Authorization': 'Basic '+ encoded }
    })
    .then(function (response) {
        //let yeast = [response.data.yeasts[0].laboratory, response.data.yeasts[0].name, response.data.yeasts[0].description];
        let allBeers = []
        for(let i=0; i<response.data.length; i++){
            allBeers.push(response.data[i]._id)
        }
        return data = {
            allBeers: allBeers
            //yeast: yeast
        }
    }
    )
    .catch(function (error) {
      //console.log(error);
      return data = 'error'
    })
    
    //const update = { yeast: data.yeast[0]}
    //console.log(Beer.count({}))
    //console.log(`data.yeast = ${data.yeast[0]}, ${data.yeast[1]}, ${data.yeast[2]}`)
    //const update = await Beer.findByIdAndUpdate({"_id": `${beer.id}`}, {"yeast": `${data.yeast}`})
    console.log(data)
    console.log('end')
    
}

app.get('/update', (req, res) => {
    console.log("running update")
    updateData()
})

app.get('/login', (req, res) =>{
    res.render('login');
})

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {return next(err)}
        req.flash('success', 'logged out');
        res.redirect('/taplist');
    });
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message =  'Something Went Wrong' 
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`serving on port ${port}`)
})
