const mongoose = require('mongoose');
const Recipes = mongoose.model('Recipes', 
    new mongoose.Schema({
        name: String,
        price: Number,
        majorOnly: Boolean
    })
)
module.exports = Recipes