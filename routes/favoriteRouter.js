const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');

const Fav = require('../models/favorite');
var authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
//GET option allowed for authenticated user
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Fav.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((fav) => {
        res.setHeader('Content-Type', 'application/json');
        res.json(fav);
        res.statusCode = 200;
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //Find user using id in token
    Fav.findOne({ user: req.user._id })
        .then((fav) => {
            if (fav != null) {
                console.log('User Exists')
                //User already exists
                // [
                //     {"_id": "5f6fa0b35b9a825574fc5175"},
                //     {"_id": "5f6fa0a85b9a825574fc5174"}
                // ]
                // Request body iterated through forEach loop
                req.body.forEach(dish => {
                    if (fav.dishes.indexOf(dish._id) === -1)
                        fav.dishes.push(dish); //if dish is not already set as favorite
                    else {
                        res.end(`Dish ${dish._id} already set as favorite`) //dish already set as favorite
                        req.statusCode = 400;
                    }
                });
                fav.save() //save dish as favorite
                    .then((favorite) => {
                        Fav.findOne({ user: req.user._id })
                            .populate('user')
                            .then((favorite) => {
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                                res.statusCode = 200;
                            }, (error) => next(error))
                            .catch((error) => next(error));
                    }, (error) => next(error))
                    .catch((error) => next(error));
            } 
            else {
                Fav.create({ user: req.user._id }) //Create new list
                    .then((fav) => {
                        req.body.forEach(d => {
                            fav.dishes.push(d);
                        });
                        fav.save() // save dish as fav
                            .then((favorite) => {
                                Fav.findOne({ user: req.user._id })
                                    .populate('user')
                                    .then((favorite) => {
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                        res.statusCode = 200;

                                    }, (error) => next(error))
                                    .catch((error) => next(error));
                            }, (error) => next(error))
                            .catch((error) => next(error));
                    }, (error) => next(error))
                    .catch((error) => next(error));
            }
        }, (error) => next(error))
        .catch((error) => next(error));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Fav.findOneAndRemove({"user": req.user._id}) // remove form database
    .then((resp) => {
        res.setHeader('Content-Type', 'application/json');
        // res.json(resp);
        res.statusCode = 200;
        res.end('Deleted favorite list successfully');
    }, (err) => next(err))
    .catch((err) => next(err));   
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//GET option allowed for authenticated user
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.end('GET not supported on /favorites/'+ req.params.dishId);
    res.statusCode = 403;
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Fav.findOne({user: req.user._id}) // save favorite
    .then((fav) => {
        if (fav) {            
            if (fav.dishes.indexOf(req.params.dishId) === -1) {
                fav.dishes.push(req.params.dishId)
                fav.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (error) => next(error))
            }
            else {
                res.statusCode = 400;
                res.end("Dish already set as favorite")
            }
        }
        else {
            Fav.create({"user": req.user._id, "dishes": [req.params.dishId]})
            .then((favorite) => {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.json(favorite);
            }, (errpr) => next(errpr))
        }
    }, (error) => next(error))
    .catch((error) => next(error));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
    res.statusCode = 403;
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Fav.findOne({user: req.user._id})
    .then((fav) => {
        if (fav) {            
            if (fav.dishes.indexOf(req.params.dishId) >= 0) { //if dish exists
                fav.dishes.splice(fav.dishes.indexOf(req.params.dishId), 1);
                fav.save()
                .then((fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end("Deleted Successfully");
                }, (error) => next(error));
            }
            else {
                error = new Error('Dish ' + req.params.dishId + ' not found');
                error.status = 404;
                return next(error);
            }
        }
        else {
            err = new Error('Favorite dish not found');
            err.status = 404;
            return next(err);
        }
    }, (error) => next(error))
    .catch((error) => next(error));
});


module.exports = favoriteRouter;