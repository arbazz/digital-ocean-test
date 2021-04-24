const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const api = require("./routes/api");
const admin = require("./routes/admin");
const port = process.env.PORT || 4002;
const errorHandler = require('./helpers/error-handler.js');
const app = express();
const fileUpload = require('express-fileupload');

const connectDB = require("./config/db");
connectDB();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, token, X-Requested-With, Content-Type, Accept");
    next();
});

// global error handler
app.use(errorHandler);

// error handler
/* eslint no-unused-vars: 0 */
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

app.use('/', api);
app.use('/admin', admin);

app.get("/", (req, res) => {
    res.send("Server is up and running!");
});

app.listen(port, () => {
    console.log("SERVER Listening at port : " + port);
});

