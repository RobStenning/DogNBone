const BaseJoi = require('joi')
const sanitizedHtml = require('sanitize-html')

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizedHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.beerSchema = Joi.object({
    beer: Joi.object({
        tapNo: Joi.number().required().min(1),
        name: Joi.string().required().escapeHTML(),
        bfId: Joi.string().required().escapeHTML(),
        previewDescription: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        ontap: Joi.string().required().escapeHTML()
    }).required()
});
