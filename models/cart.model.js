const mongoose = require('mongoose');
const Cart = mongoose.model('Cart', 
    new mongoose.Schema({
        name: String,
        price: Number,
        cart : [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipes'
            }
        ]
    })
)
module.exports = Cart