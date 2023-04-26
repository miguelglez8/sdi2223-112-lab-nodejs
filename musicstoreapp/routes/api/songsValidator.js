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