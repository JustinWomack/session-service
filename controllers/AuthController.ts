import { UserModel, tUserDocument } from '../models';
import { Request, Response, NextFunction } from 'express';
import PasswordValidator from 'password-validator';
import bcrypt from 'bcryptjs';
import passport from 'passport';

// @TODO add reset password controller

const validator: PasswordValidator = new PasswordValidator()
    .is().min(8)
    .is().max(32)
    .has().uppercase()
    .has().lowercase()
    .has().not().spaces()

type Callback = (err: string) => void;

interface iPassportRequest extends Request {
    isAuthenticated: () => boolean;
    logout: () => void;
    login: (user: tUserDocument, cb: Callback) => void;
}

const AuthController = {
    auth: (req: iPassportRequest, res: Response, next: NextFunction) => {
        if (req.isAuthenticated()) {
            res.status(200).json({msg: 'Authenticated'})
        } else {
            res.status(401).json({msg: 'Not Authenticated'})
        }
    },
    logout: (req: iPassportRequest, res: Response, next: NextFunction) => {
        req.logout();
        res.redirect('./');
    },
    login: (req: iPassportRequest, res: Response, next: NextFunction) => {
        passport.authenticate('local', function(err: Error, user: tUserDocument, info: string) {
            if (err) { return next({msg: err}); }
            if (!user) { return res.status(401).json({msg: 'Username or password is incorrect'}); }

            req.login(user, function(err) {
              if (err) { return next({msg: err}); }
              return res.status(200).json({msg: 'Successfully authenticated'});
            });
        })(req, res, next);
    },
    register: (req: iPassportRequest, res: Response, next: NextFunction) => {
        const name = req.body.username;
        const pw = req.body.password;
        const valid = validator.validate(pw, {list: true});

        if (name && pw) {
            if (valid.length === 0) {
                UserModel.findOne({username: name}, (err, user: tUserDocument | null) => {
                    if (!err) {
                        if (!user) {
                            bcrypt.genSalt(10, (err: Error, salt: string) => {
                                bcrypt.hash(pw, salt, (err: Error, hash: string) => {
                                    UserModel.create({username:name, password: hash}, (err, user: tUserDocument) => {
                                        if (!err) {
                                            res.status(200).send({msg: `User ${user.username} created`})
                                        } else { next({msg: err}) }
                                    })
                                })
                            })
                        } else { next({msg: 'Username already exists'}) }
                    } else { next({msg: err}) }
                })
            } else {
                next({msg: valid})
            }
        } else { next({msg: 'Malformed request'}) }
    },
}

export default AuthController;
