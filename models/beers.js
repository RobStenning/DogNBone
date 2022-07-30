const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BeerSchema = new Schema({
    tapNo: Number,
    name: String,
    bfName: String,
    bfId: String,
    abv: Number,
    style: String,
    ibu: Number,
    dryHops: Number,
    previewDescription: String,
    description: String,
    ontap: String
});

module.exports = mongoose.model('Beer', BeerSchema);