const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hopSchema = new Schema({
    name : String,
    use : String,
    alpha : String,
    amount : String
})

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
    ontap: String,
    brewedDate: Number,
    yeast: [{
        lab : String,
        name : String,
        description : String
    }],
    hopsName: [String],
    hopsUse: [String],
    hopsAlpha: [Number],
    hopsAmount: [Number],
    maltsSupplier: [String],
    maltsName: [String],
    maltsAmount: [Number]
});

module.exports = mongoose.model('Beer', BeerSchema);