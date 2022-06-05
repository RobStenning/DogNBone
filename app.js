const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/dog-and-bone');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Beer = require('./models/beers');
const beers = require('./models/beers');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use('/styles', express.static(__dirname + '/styles'))

app.get('/', async (req, res) => {
    const beers = await Beer.find({});
    const displayOntap = await Beer.findOne({ ontap: 'pouring'});
    res.render('home', { beers, displayOntap });
})

app.get('/taplist', async (req, res) => {
    const beers = await Beer.find({})
    const displayOntap = await Beer.findOne({ ontap: 'pouring'});
    const displayIncoming = await Beer.findOne({ ontap: 'kegged'});
    const displayBottled = await Beer.findOne({ ontap: 'bottled'});
    const displayPrevious = await Beer.findOne({ ontap: 'previous'});
    res.render('beers/taplist', { beers, displayOntap, displayIncoming, displayBottled, displayPrevious });
})

app.get('/previousbeers', async (req, res) => {
    const beers = await Beer.find({})
    const displayPrevious = await Beer.findOne({ ontap: 'previous'});
    res.render('beers/previousbeers', { beers, displayPrevious});
})

app.get('/new', (req, res) => {
    res.render('beers/new');
})

app.post('/beers', async (req, res) => {
    const beer = new Beer(req.body.beer)
    await beer.save();
    res.redirect(`/beers/${beer._id}`)
})

app.get('/beers/:id', async (req, res) => {
    const beer = await Beer.findById(req.params.id)
    res.render('beers/info', { beer })
})

app.get('/beers/:id/edit', async (req, res) => {
    const beer = await Beer.findById(req.params.id)
    res.render('beers/edit', { beer })
})

app.put('/beers/:id', async (req, res) => {
    const { id } = req.params
    const beer = await beers.findByIdAndUpdate(id, { ...req.body.beer })
    res.redirect(`/beers/${beer._id}`)
})

app.delete('/beers/:id', async (req, res) => {
    const { id } = req.params;
    await beers.findByIdAndDelete(id)
    res.redirect('/taplist')
})

app.get('/login', (req, res) =>{
    res.render('login');
})

app.listen(3000, () => {
    console.log('serving on port 3000')
})
