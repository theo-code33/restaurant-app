const express = require("express")
const morgan = require("morgan")

const app = express()

const port = process.env.PORT || 8000

app.use(morgan('dev'))
app.set('view engine', 'ejs')

const items = [
    { id: 0, name: 'Brezel', price: 1.70, majorOnly: false },
    { id: 1, name: 'Frites', price: 3.99, majorOnly: true },
    { id: 2, name: 'Tiramisu', price: 5.50, majorOnly: false },
    { id: 3, name: 'Cheese', price: 5.99, majorOnly: true },
    { id: 4, name: 'Saumon', price: 16.99, majorOnly: false },
    { id: 5, name: 'Steak Frites', price: 13.40, majorOnly: false },
    { id: 6, name: 'Croque Monsieur', price: 8.99, majorOnly: true },
    { id: 7, name: 'Salade de pâtes', price: 10.99, majorOnly: false }
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


