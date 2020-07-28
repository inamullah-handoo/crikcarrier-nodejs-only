const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const passport = require('passport');
const session = require('express-session');


// database connection
mongoose.connect('mongodb://localhost:27017/crikcarrier',{ useNewUrlParser: true });
let db = mongoose.connection;

// check db connection
db.once('open', function(){
    console.log("Connected to MongoDB");
});

// check for db errors
db.on('error', function(err){
    console.log(err);
});

// express init
const app = express();


// handlebars helpers
var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        ifCond: function(v1, v2, options) {
            if(v1 == v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    }
});

// handlebars middleware
app.engine('handlebars', hbs.engine, exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// bodyparse middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// static folder
app.use(express.static(path.join(__dirname,'public')));

//  express session middleware
app.use(session({
    secret: 'dream',
    resave: true,
    saveUninitialized: true
}));

// express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length){
            formParam += '['+namespace.shift()+']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

// passport config
// require('./config/passport')(passport);

// passport middleware
// app.use(passport.initialize());
// app.use(passport.session());

// app.get('*', (req,res,next) => {
//     res.locals.user = req.user || null;
//     next();
// });

// home route
app.get('/', (req,res) => {
    res.render('home',{
        title:'CrikCarrier | Home',
        homeActive: 'bg-white text-success font-weight-bold'
    });
});

// abour us route
app.get('/aboutUs', (req,res) => {
    res.render('aboutUs',{
        title:'CrikCarrier | About Us',
        aboutUsActive: 'bg-white text-success font-weight-bold'
    });
});

// route files
app.use('/match', require('./routes/match'));
app.use('/views', require('./routes/views'));
app.use('/progress', require('./routes/progress'));

// start files
app.listen(3000, () =>console.log("Server started at 3000"));