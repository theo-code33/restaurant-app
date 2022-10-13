const express = require("express")
const morgan = require("morgan")

const app = express()

const port = process.env.PORT || 8000

app.use(morgan('dev'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.send('Hello Restau app')
})

app.listen(port, () => {
    console.log(`App running on port ${port}, http://localhost:${port}`);
})


