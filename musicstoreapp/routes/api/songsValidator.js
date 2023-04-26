const {check} = require('express-validator')
exports.songsValidatorInsert = [
    check("title", "Title is required").not().trim().isEmpty(),
    check("title", "Title must be 5 characters or more").trim().isLength({min: 5}),
    check("kind", "Kind is required").not().trim().isEmpty(),
    check("kind", "Kind must be 5 characters or more").trim().isLength({min: 5}),
    check("price", "Price is required").not().trim().isEmpty(),
    check("price", "Price must be a number").isNumeric(),
    check("price").custom( value => {
        if (value < 0) {
            throw new Error("Price must be positive")
        }
        return true;
    }),
]

exports.songsValidatorUpdate = [
    check('title')
        .if(check('title').exists())
        .trim().isLength({min:5})
        .withMessage('title must be 5 characters'),
    check('kind')
        .if(check('kind').exists())
        .trim().isLength({min:5})
        .withMessage('kind must be 5 characters'),
    check('price')
        .if(check('price').exists())
        .isNumeric()
        .withMessage('price must be numeric'),
    check('price')
        .if(check('price').exists())
        .custom( value => {
            if (value < 0) {
                throw new Error("Price must be positive")
            }
            return true;
        })
        .withMessage('price must be numeric'),
]