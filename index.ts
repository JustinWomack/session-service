import express from 'express';
import session from 'express-session';
import connect from 'connect-mongo';
import passport from 'passport';
import local from 'passport-local';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import { AuthRouter } from './routers';
import { UserModel, tUserDocument } from './models';

dotenv.config();
const app = express();
const MongoStore = connect(session);
const LocalStrategy = local.Strategy;
const port = process.env.PORT || 3500;

////////////////////////////////////////////////////////////////////////////////
// Passport configuration
passport.use(new LocalStrategy(
    (username: string, password: string, done) => {
        UserModel.findOne({username: username}, (err, user) => {
            if (err) { return done(err) }
            if (!user) { return done(null, false) }
            bcrypt.compare(password, user.password, (err: Error, correct: boolean) => {
                if (correct) {
                    return done(null, user)
                } else {
                    return done(null, false)
                }
            });
        })
    }
));

passport.serializeUser((user: tUserDocument, done) => {
    done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
    UserModel.findById(id, (err, user: tUserDocument) => {
        if (!err) {
            done(null, user)
        } else {
            done(err, false)
        }
    })
});

////////////////////////////////////////////////////////////////////////////////
// MongoDB / Mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/sessions');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('MongoDB Connected Successfully!');
});

////////////////////////////////////////////////////////////////////////////////
// Express Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
    genid: (req) => {
        return uuidv4()
    },
    store: new MongoStore({mongooseConnection: db}),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

////////////////////////////////////////////////////////////////////////////////
// Routes
app.use(AuthRouter);

app.use((err, req, res, next) => {
    // @TODO create an error handler.
    res.status(500).json(err)
});

app.listen(port, () => {
    console.log(`Listening on ${port}`)
});
