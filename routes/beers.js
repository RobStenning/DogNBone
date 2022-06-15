const express = require('express');
const router = express.Router();
const catchAsync = require('../tools/catchAsync');
const { beerSchema } = require('../validateSchemas/schemas.js');
const ExpressError = require('../tools/ExpressError');
const Beer = require('../models/beers');

const validateBeer = (req, res, next) => {
    const { error } = beerSchema.validate(req.body);
    if (error) {
        const message = error.details.map(element => element.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }
}

router.post('/', validateBeer, catchAsync(async (req, res, next) => { 
    const beer = new Beer(req.body.beer)
    await beer.save();
    req.flash('success', 'New Beer Added')
    res.redirect(`/beers/${beer._id}`)
}))

router.get('/:id', catchAsync(async (req, res, next) => {
    const beer = await Beer.findById(req.params.id)
    res.render('beers/info', { beer })
}))

router.get('/:id/edit', catchAsync(async (req, res, next) => {
    const beer = await Beer.findById(req.params.id)
    res.render('beers/edit', { beer })
}))

router.put('/:id', validateBeer, catchAsync( async (req, res, next) => {
    const { id } = req.params
    const beer = await Beer.findByIdAndUpdate(id, { ...req.body.beer })
    res.redirect(`/beers/${beer._id}`)
}))

router.delete('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Beer.findByIdAndDelete(id)
    req.flash('deleted', 'Beer Deleted')
    res.redirect('/taplist')
}))

module.exports = router;