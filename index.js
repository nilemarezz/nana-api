require('dotenv').config()
const express = require('express')
const app = express()
const cors = require("cors");
const bodyParser = require("body-parser");
const SearchRoute = require('./routes/search')

var http = require("http");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/api", (req, res) => {
    res.json({ success: true, user: 'test' })
})
app.use("/api/search", SearchRoute)

app.listen(process.env.PORT || 5000, process.env.YOUR_HOST || '0.0.0.0', () => {
    console.log('Nana API run at port ' + process.env.PORT || 5000)
})