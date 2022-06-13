const Joi = require('joi')


module.exports.beerSchema = Joi.object({
    beer: Joi.object({
        name: Joi.string().required(),
        abv: Joi.number().required().min(0),
        style: Joi.string().required(),
        ibu: Joi.number().required().min(0),
        dryHops: Joi.number().required().min(0),
        previewDescription: Joi.string().required(),
        description: Joi.string().required(),
        ontap: Joi.string().required(),
    }).required()
});
