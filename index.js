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

setInterval(function () {
    http.get("http://catchy-api.herokuapp.com");
}, 300000); // every 5 minutes (300000)

app.listen(process.env.PORT || 5000, process.env.YOUR_HOST || '0.0.0.0', () => {
    console.log('Nana API run at port ' + process.env.PORT || 5000)
})