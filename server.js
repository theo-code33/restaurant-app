require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const mongoose = require('mongoose')
const models = require('./models/index');
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
})

const items = [
    { id: 0, name: 'Today\'s special', price: 19.90, majorOnly: false },
    { id: 1, name: 'Sandwich', price: 6, majorOnly: false },
    { id: 2, name: 'Milshake', price: 3, majorOnly: false },
    { id: 3, name: 'Coca', price: 2, majorOnly: false },
    { id: 4, name: 'Alcoholic drink', price: 7, majorOnly: true }
]

const user = {}

const verifyBudget = (res, totalCart, itemPrice, itemsList, user, index) => {
    if (totalCart < parseFloat(user.budget) && totalCart + itemPrice < parseFloat(user.budget)){
        user.totalCart += itemsList[index].price
        user.cart.push(itemsList[index])
        res.render('menu', {
            name: user.name,
            items: itemsList,
            cart: user.cart,
            total: parseFloat(user.totalCart).toFixed(2)
        })
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

const isMinor = (user, res, total, list, checkBudget, index) => {
    if (user.age < 18){
        let itemsYoung = list.filter(item => !item.majorOnly)
        if(checkBudget){
            checkBudget(res, total, itemsYoung[index].price, itemsYoung, user, index)
        }else{
            res.render('menu', {
                name: user.name,
                items: itemsYoung,
                cart: user.cart,
                total: total
            })
        }
    }else{
        if(checkBudget){
            checkBudget(res, total, list[index].price, list, user, index)
        }else{
            res.render('menu', {
                name: user.name,
                items: list,
                cart: user.cart,
                total: total
            })
        }
    }
}

app.get('/', (req, res) => {
    res.render('form')
})

app.get('/getMenu', (req, res) => {
    const { firstName: name, age, budget } = req.query
    user.name = name
    user.age = age
    user.budget = budget
    user.cart = []
    user.totalCart = 0
    console.log(name);
    isMinor(user, res, user.totalCart, items)
})

app.get('/addToCart/:id', (req, res) => {
    const { id } = req.params
    isMinor(user, res, user.totalCart, items, verifyBudget, id)
})

app.get('/removeItem/:id', (req, res) => {
    const { id } = req.params
    user.totalCart -= user.cart[id].price
    user.cart.splice(id, 1)

    isMinor(user, res, parseFloat(user.totalCart).toFixed(2), items)
})

app.listen(port, () => {
    console.log(`App running on port ${port}, http://localhost:${port}`);
})