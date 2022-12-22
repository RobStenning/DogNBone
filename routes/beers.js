const express = require('express');
const router = express.Router();
const catchAsync = require('../tools/catchAsync');
const { beerSchema } = require('../validateSchemas/schemas.js');
const { isLoggedIn } = require('../tools/middleware')
const ExpressError = require('../tools/ExpressError');
const Beer = require('../models/beers');
const axios = require('axios');

const validateBeer = (req, res, next) => {
    const { error } = beerSchema.validate(req.body);
    if (error) {
        const message = error.details.map(element => element.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }
};
const username = process.env.brewFatherUName;
const password = process.env.brewFatherPassword;
let token = `${username}:${password}`;
let encoded = Buffer.from(token).toString('base64');

router.post('/', isLoggedIn, validateBeer, catchAsync(async (req, res, next) => { 
    const beer = new Beer(req.body.beer)
    await beer.save();
    req.flash('success', 'New Beer Added')
    res.redirect(`/beers/${beer._id}`)
}))

router.get('/:id', catchAsync(async (req, res, next) => {
    const beer = await Beer.findById(req.params.id)
        await axios({
        method: 'get',
        url: 'https://api.brewfather.app/v1/recipes/' + beer.bfId,
        headers: { 'Authorization': 'Basic '+ encoded }
    })
    .then(function (response) {
        let hops = [];
        
        for (let i = 0; i < response.data.hops.length; i++){
            const hop = {
                name: response.data.hops[i].name,
                use: response.data.hops[i].use,
                alpha: response.data.hops[i].alpha,
                amount: response.data.hops[i].amount   
            };
            hops.push(hop)
        };
        
        let malts = [];
        for (let i = 0; i < response.data.data.mashFermentables.length; i++){
            const malt = {
                supplier: response.data.data.mashFermentables[i].supplier,
                name: response.data.data.mashFermentables[i].name,
                amount: response.data.data.mashFermentables[i].amount
            };
            malts.push(malt)
        };
        
        let yeast = [response.data.yeasts[0].laboratory, response.data.yeasts[0].name];
        let brewedDate = [response.data._created._seconds];
        
        return data = {
            hops: hops,
            malts: malts,
            yeast: yeast,
            brewedDate: brewedDate
        }
    }
    )
    .catch(function (error) {
      console.log(error);
      return data = 'error'
    })
    res.render('beers/info', { beer, data})
    console.log(data.brewedDate)
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res, next) => {
    const beer = await Beer.findById(req.params.id)
    res.render('beers/edit', { beer })
}))

router.put('/:id', validateBeer, catchAsync( async (req, res, next) => {
    const { id } = req.params
    const beer = await Beer.findByIdAndUpdate(id, { ...req.body.beer })
    res.redirect(`/beers/${beer._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Beer.findByIdAndDelete(id)
    req.flash('deleted', 'Beer Deleted')
    res.redirect('/taplist')
}))

module.exports = router;