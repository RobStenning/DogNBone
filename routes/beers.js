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
}
let brewFatherBeerId = 'YOX7D8z2Iz8pH1PIdP1Wys9X3gCnSo'
const username = process.env.brewFatherUName;
const password = process.env.brewFatherPassword;
//let session_url = 'https://api.brewfather.app/v1/recipes/vIY6lRqNgvA5tLky59bhDU10P8Wdq0';
let session_url = 'https://api.brewfather.app/v1/recipes/';
let token = `${username}:${password}`;
let encoded = Buffer.from(token).toString('base64');

let axiosConfig = {
    method: 'get',
    url: session_url + brewFatherBeerId,
    headers: { 'Authorization': 'Basic '+ encoded }
  };

/* API Process
store BF data, name and ID at new beer or ID stage
Take bfId
Get BF data for recipe
Display data

or

take bfId's
store data
update data option?
show data at show pages

const getBrewFatherData = (req, res) => {
    axios(axiosConfig)
    .then(function (response) {
        console.log(JSON.stringify(response.data.hops[0].name))
        return data = JSON.stringify(response.data.hops[0].name)
    }
    )
    .catch(function (error) {
      console.log(error);
    })
}

getBrewFatherData();
router.get('/:id/check', getBrewFatherData, catchAsync(async (req, res, next) => {
    const beer = await Beer.findById(req.params.id)
    console.log(beer.id)
    console.log(beer.bfId);
}))


function getSourBeerData() {
    axios.get('https://api.brewfather.app/v1/recipes/YOX7D8z2Iz8pH1PIdP1Wys9X3gCnSo')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
}
*/


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
        }
        /*
        fermentables needs work, odd configuration from BF JSON
        let malts = [];
        
        for (let i = 0; i < response.data.fermentables.mashFermentables.length; i++){
            const malt = {
            name: response.data.mashFermentables[i].supplier,
            use: response.data.mashFermentables[i].name   
        };
            malts.push(malt)
        }
        */
        let yeast = [response.data.yeasts[0].laboratory, response.data.yeasts[0].name];
        return data = {
            hops: hops,
            //malts: malts,
            yeast: yeast
        }
    }
    )
    .catch(function (error) {
      console.log(error);
      return data = 'error'
    })
    //console.log(data.hops)
    res.render('beers/info', { beer, data})
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