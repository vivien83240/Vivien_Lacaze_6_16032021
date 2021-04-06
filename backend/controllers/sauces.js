const Sauce = require('../models/Sauces');
const fs = require('fs');

/////// Création d'une sauce
exports.createSauce = (req, res, next) => {
    console.log(req.body.sauce)
  const sauceObject = JSON.parse(req.body.sauce);
    console.log(sauceObject)
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
     sauce.save()
       .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
};

/////// Modification d'une sauce
exports.modifySauce = (req, res, next) => {
  let sauceObject = req.file ?
  {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  
  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, function (error) {
          if (error) throw error;
        });
    })
    .catch(error => res.status(500).json({ error }));  
    sauceObject;
  } else {
    sauceObject;
  }
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

////// Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

////// Récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

////// Récupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
};

////// Création et suppression de like
exports.createLike = (req, res, next) => {
  const like = req.body.like;
  const userId = req.body.userId;
  const sauceId = req.params.id;

  if (like == 1){ 
    Sauce.update({ _id: sauceId }, 
      {
        $inc: { likes: 1 },
        $push: { usersLiked: userId }
      })
      .then(() => res.status(200).json({ message: 'Sauce liké !'}))
      .catch(error => res.status(404).json({ error }));
      
  }else if (like == -1){ 
    Sauce.update({ _id: sauceId },
      {
        $inc: { dislikes: 1 }, 
        $push: { usersDisliked: userId }
      })
      .then(() => res.status(200).json({ message: 'Sauce disliké !'}))
      .catch(error => res.status(404).json({ error }));
        
  }else{ 
    Sauce.findOne({ _id: req.params.id })
    .then((sauces) => {
      if (sauces.usersDisliked.find(userId => userId === req.body.userId)){ 
        Sauce.update({ _id: sauceId }, 
          {
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: userId }
          })
        .then(() => res.status(200).json({ message: 'La sauce n\'est plus disliké !'}))
        .catch(error => res.status(404).json({ error }));
    
      }else{
      Sauce.update({ _id: sauceId }, 
          {
            $inc: { likes: -1 },
            $pull: { usersLiked: userId }
          })
        .then(() => res.status(200).json({ message: 'La sauce n\'est plus liké !'}))
        .catch(error => res.status(404).json({ error }));
      }
    })
    .catch(error => res.status(404).json({ error }));
  };
};