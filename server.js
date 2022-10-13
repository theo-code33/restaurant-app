const express = require("express")
const morgan = require("morgan")

const app = express()

const port = process.env.PORT || 8000

app.use(morgan('dev'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('form')
})

app.get('/getMenu', (req, res) => {
    res.render('menu')
})

app.listen(port, () => {
    console.log(`App running on port ${port}, http://localhost:${port}`);
})


