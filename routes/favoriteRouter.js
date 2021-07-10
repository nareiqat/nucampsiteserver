const express = require("express");
const Favorite = require("../models/favorites");
const authenticate = require("../authenticate");
const cors = require("./cors");
const { findOneAndRemove } = require("../models/favorites");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find(
      {user:req.user._id}
    )
      .populate("user")
      // .populate("favorites")
      .then((favorites) => {
        console.log(req.user._id);
        console.log(favorites);
        
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            req.body.forEach(fav => {
                if (!favorite.campsites.includes(fav._id)) {
                    favorite.campsites.push(fav._id);
                }
            });
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            Favorite.create({ user: req.user._id })
            .then(favorite => {
                req.body.forEach(fav => {
                    if (!favorite.campsites.includes(fav._id)) {
                        favorite.campsites.push(fav._id);
                    }
                });
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
        }
    }).catch(err => next(err));
})
  
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res) => {
      
      res.statusCode = 403;
      res.end("PUT operation not supported on /favorites");
    }
  )
  .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
      Favorite.findOneAndRemove({user:req.user._id})
     
        .then((favorite) => {
          res.statusCode = 200;
          if(favorite){
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          } else {
            res.setHeader("Content-Type", "text/plain");
            res.end('you do not have favorite to delete');
          }
         
        })
        .catch((err) => next(err));
    }
  );

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites");
    
  })
  .post(cors.corsWithOptions, authenticate.verifyUser,(req, res) => {
      Favorite.findOne({user: req.user_id})
      .then(favorite => {
        if(favorite){
          if(!favorite.campsites.includes(req.params.campsiteId)){
            favorite.campsites.push(req.params.campsiteId)
            favorite.save()
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          }).catch(err => next(err))
          } else{
            res.setHeader("Content-Type", "text/plain");
            res.end('campsite is already a favorite');
          }
          
          
        }else{
          Favorite.create({user: req.user_id, campsites: [req.params.id]})
          .then(favorite => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch(err => 
              next(err)
            )
        }
      }) 
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res) => {
      
      res.statusCode = 403;
      res.end("PUT operation not supported on /favorites");
    }
   
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
  
    (req, res, next) => {
      Favorite.findOne({user: req.user_id})
        .then((response) => {
          if(response){
            const index = response.campsites.indexOf(req.params.campsiteId);
            if(index>=0){
              response.campsites.splice(index,1)
            }
            response.save().then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
          } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain")
          }
         
        })
        .catch((err) => next(err));
    }
  );

module.exports = favoriteRouter;
