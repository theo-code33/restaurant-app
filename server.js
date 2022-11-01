require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const mongoose = require('mongoose')
const models = require('./models/index');
const { cart } = require('./models/index');
const Recipes = models.recipes
const Cart = models.cart

const app = express()

const port = process.env.PORT || 8000

app.use(morgan('dev'))
app.set('view engine', 'ejs')

const username_bdd = process.env.USERNAME_BDD;
const password_bdd = process.env.PASSWORD_BDD;
const cluster_name = process.env.CLUSTER_NAME;
const port_bdd = process.env.PORT_BDD;

mongoose.connect(`mongodb://${username_bdd}:${password_bdd}@${cluster_name}:${port_bdd}/?retryWrites=true&w=majority`, { useNewUrlParser: true });
const db = mongoose.connection;

mongoose.connection.on('error', (err) => {
    console.error("Connection error", err);
    process.exit();
})
mongoose.connection.once('open', () => {
    console.log("Successfully connect to MongoDB.");
    initial()
})

const items = [
    { name: 'Today\'s special', price: 19.90, majorOnly: false },
    { name: 'Sandwich', price: 6, majorOnly: false },
    { name: 'Milshake', price: 3, majorOnly: false },
    { name: 'Coca', price: 2, majorOnly: false },
    { name: 'Alcoholic drink', price: 7, majorOnly: true }
]
function createItem(item){
    const newItem = new Recipes({
        name: item.name,
        price: item.price,
        majorOnly: item.majorOnly
    })
    newItem.save( err => {
        if(err){
            console.log("Error:", err);
        }
        console.log("Saved recipe to database.");
    })
}
function addToCart(id, name, price, user, list, res){
    const newItem = new Cart({
        name: name,
        price: price,
        cart: id
    })
    newItem.save( err => {
        if(err){
            console.log("Error:", err);
        }
        console.log("Saved recipe in cart collections.");
        const cartData = Cart.find({}, (err, cart) => {
            if(err){
                console.log("Error:", err);
            }else{
                user.cart = [...cart]
                console.log("Cart:", user.cart);
                res.render('menu', {
                    name: user.name,
                    items: list,
                    cart: user.cart,
                    total: parseFloat(user.totalCart).toFixed(2),
                })
            }
        })
    })
}

function initial(){
    Recipes.estimatedDocumentCount((err, count) => {
        if(!err && count === 0){
            items.forEach(item => {
                createItem(item)
            })
        }
    })
}

const user = {}

const verifyBudget = async (res, totalCart, itemsList ,user, index) => {
    Recipes.findById(index, async (err, item) => {
        if(err){
            console.log("Error:", err);
        }else{
            if (totalCart < parseFloat(user.budget) && totalCart + item.price < parseFloat(user.budget)){
                user.totalCart += item.price
                await addToCart(item._id, item.name, item.price, user, itemsList, res)
            }else{
                res.render('menu', {
                    name: user.name,
                    items: itemsList,
                    cart: user.cart,
                    total: parseFloat(user.totalCart).toFixed(2),
                    cartError: true
                })
            }
        }
    })
}

const isMinor = (user, res, total, list, checkBudget, index) => {
    if (user.age < 18){
        let itemsYoung = list.filter(item => !item.majorOnly)
        if(checkBudget){
            checkBudget(res, total, itemsYoung, user, index)
        }else{
            Cart.find({}, (err, cart) => {
                if(err){
                    console.log("Error:", err);
                }else{
                    user.cart = [...cart]
                    res.render('menu', {
                        name: user.name,
                        items: itemsYoung,
                        cart: user.cart,
                        total: parseFloat(user.totalCart).toFixed(2),
                    })
                }
            })
        }
    }else{
        if(checkBudget){
            checkBudget(res, total, list, user, index)
        }else{
            Cart.find({}, (err, cart) => {
                if(err){
                    console.log("Error:", err);
                }else{
                    user.cart = [...cart]
                    res.render('menu', {
                        name: user.name,
                        items: list,
                        cart: user.cart,
                        total: parseFloat(user.totalCart).toFixed(2),
                    })
                }
            })
        }
    }
}

app.get('/', (req, res) => {
    Cart.deleteMany({}, (err) => {
        if(err){
            console.log("Error:", err);
        }
    })
    res.render('form')
})

app.get('/getMenu', (req, res) => {
    const { firstName: name, age, budget } = req.query
    user.name = name
    user.age = age
    user.budget = budget
    user.totalCart = 0
    Cart.find({}, (err, cart) => {
        if(err){
            console.log("Error:", err);
        }
        user.cart = [...cart]
        if(user.cart.length > 0){
            cart.map(item => {
                user.totalCart += item.price
            })
        }else{
            user.totalCart = 0
        }
        return cart
    })
    Recipes.find({}, (err, recipes) => {
        if(err){
            console.log("Error:", err);
        }
        isMinor(user, res, user.totalCart, recipes)
    })
})

app.get('/addToCart/:id', (req, res) => {
    const { id } = req.params
    Recipes.find({}, (err, recipes) => {
        if(err){
            console.log("Error:", err);
        }
        isMinor(user, res, user.totalCart, recipes, verifyBudget, id)
    })
})

app.get('/removeItem/:id', (req, res) => {
    const { id } = req.params
    Cart.findByIdAndDelete(id, (err, cart) => {
        if(err){
            console.log("Error:", err);
        }
        user.totalCart -= cart.price
        Recipes.find({}, (err, recipes) => {
            if(err){
                console.log("Error:", err);
            }
            isMinor(user, res, parseFloat(user.totalCart).toFixed(2), recipes)
        })
    })
})

app.listen(port, () => {
    console.log(`App running on port ${port}, http://localhost:${port}`);
})