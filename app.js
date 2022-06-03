const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/dog-and-bone');
const methodOverride = require('method-override');
const Beer = require('./models/beers');
const beers = require('./models/beers');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
})

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/taplist', async (req, res) => {
    const beers = await Beer.find({})
    res.render('beers/index', { beers });
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

app.listen(3000, () => {
    console.log('serving on port 3000')
})