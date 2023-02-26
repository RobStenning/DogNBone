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
    await updateSingle(beer)
    req.flash('success', 'New Beer Added')
    res.redirect(`/beers/${beer._id}`)
}))

router.get('/:id', catchAsync(async (req, res, next) => {
    const beer = await Beer.findById(req.params.id)
    /*
    //fetching data direct from API
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
    */
   let data = 'error'
    res.render('beers/info', { beer, data })
}))

async function updateSingle(beer){
    console.log("update single")
    await axios({
        method: 'get',
        url: 'https://api.brewfather.app/v1/recipes/' + beer.bfId,
        headers: { 'Authorization': 'Basic '+ encoded }
    })
    .then(function (response) {
        let bfName = [response.data.name]
        let abv = response.data.abv
        let style = response.data.style.name
        let ibu = response.data.ibu
        let dryHops = response.data.sumDryHopPerLiter
        let brewedDate = response.data._created._seconds        
        let yeast = {
            lab: response.data.yeasts[0].laboratory,
            name: response.data.yeasts[0].name,
            description: response.data.yeasts[0].description
        }
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
        }
        return data = {
            bfName: bfName,
            abv: abv,
            style: style,
            ibu: ibu,
            dryHops: dryHops,
            brewedDate: brewedDate,
            yeast: yeast,
            hops: hops,
            malts: malts
        }
    })
    .catch(function (error) {
      return data = 'error'
    })
    console.log(beer.bfId)
    console.log(data.hops.length)
    let query = { bfId: `${beer.bfId}` }
    let replace = { 
        $set: {
            bfName: `${data.bfName}`,
            abv: `${data.abv}`,
            style: `${data.style}`, 
            ibu: `${data.ibu}`, 
            dryHops: `${data.dryHops}`,
            brewedDate: `${data.brewedDate}`,
            yeast : [ {
                "lab": `${data.yeast.lab}`,
                "name": `${data.yeast.name}`,
                "description": `${data.yeast.description}`
            }]
        }}
    const update = await Beer.findOneAndUpdate(query, replace)
    for (let i = 0; i < data.hops.length; i++){
    console.log(data.hops[i].name)
        let replace = {
            $push: 
                { 
                    hopsName: { $each: [data.hops[i].name]},
                    hopsUse: { $each: [data.hops[i].use]},
                    hopsAlpha: { $each: [data.hops[i].alpha]},
                    hopsAmount: { $each: [data.hops[i].amount]}
                }
        }
    const update = await Beer.findOneAndUpdate(query, replace)
    }
    for (let i = 0; i < data.malts.length; i++){
    console.log(data.malts[i].name)
        let replace = {
            $push: 
                { 
                    maltsSupplier: { $each: [data.malts[i].supplier]},
                    maltsName: { $each: [data.malts[i].name]},
                    maltsAmount: { $each: [data.malts[i].amount]}
                }
        }
    const update = await Beer.findOneAndUpdate(query, replace)
    }

}
async function clear(beer){
    console.log("clearing hops")
    let query = { bfId: `${beer.bfId}` }
    let replace = { $set: 
        { 
            hopsName: [],
            hopsUse: [],
            hopsAlpha: [],
            hopsAmount: [],
            maltsSupplier: [],
            maltsName: [],
            maltsAmount: []
        }           
    }
    const update = await Beer.findOneAndUpdate(query, replace)
    updateSingle(beer)
}

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res, next) => {
    const beer = await Beer.findById(req.params.id)
    res.render('beers/edit', { beer })
}))

router.get('/:id/update', isLoggedIn, catchAsync(async (req, res, next) => {
    const beer = await Beer.findById(req.params.id)
    clear(beer)
    //updateSingle(beer)
    res.redirect(`/beers/${beer._id}`)
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