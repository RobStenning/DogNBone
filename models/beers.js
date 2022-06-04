const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BeerSchema = new Schema({
    name: String,
    abv: Number,
    style: String,
    ibu: Number,
    dryHops: Number,
    previewDescription: String,
    description: String,
    ontap: String
});

module.exports = mongoose.model('Beer', BeerSchema);