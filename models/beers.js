const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BeerSchema = new Schema({
    name: String,
    abv: Number,
    style: String,
    ibu: Number,
    dryHops: Number,
    description: String
});

module.exports = mongoose.model('Beer', BeerSchema);