const mongoose = require('mongoose');
const Cart = mongoose.model('Cart', 
    new mongoose.Schema({
        cart : [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipes'
            }
        ]
    })
)