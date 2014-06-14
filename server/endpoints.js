module.exports = function(models, fs, path){
  return {
    tagUpdate:  function(req, res){
      return models.tag.findById(req.params.id, function (err, data) {
        data.text = req.body.text;
        return data.save(function(err){
          if (!err) {
            return res.send("");
          } else {
            return console.error(err);
          }
         });
      });
     },
     messageUpdate:  function(req, res){
      return models.message.findById(req.params.id, function (err, data) {
        data.text = req.body.text;
        data.tags = req.body.tags;
        data.published = req.body.published;
        return data.save(function(err){
          if (!err) {
            return res.send("");
          } else {
            return console.error(err);
          }
         });
      });
     },
     imageUpdate:  function(req, res){
      return models.image.findById(req.params.id, function (err, data) {
        data.name = req.body.name;
        data.extension = req.body.extension;
        data.tags = req.body.tags;
        data.artist = req.body.artist;
        data.age = req.body.age;
        data.orientation = req.body.orientation;
        return data.save(function(err){
          if (!err) {
            return res.send("");
          } else {
            return console.error(err);
          }
         });
      });
     },
      cardUpdate:  function(req, res){
      return models.card.findById(req.params.id, function (err, data) {
        data.image = req.body.image;
        data.messageText = req.body.messageText;
        data.from = req.body.from;
        data.fromEmail = req.body.fromEmail;
        data.to = req.body.to;
        data.toEmail = req.body.toEmail;
        data.amount = req.body.amount;
        data.uuid = req.body.uuid;
        data.status = req.body.status;
        return data.save(function(err){
          if (!err) {
            return res.send("");
          } else {
            return console.error(err);
          }
         });
      });
     },
    tagDelete:  function(req, res){
      return models.tag.findById(req.params.id, function (err, data) {
        return data.remove(function(err){
          if (!err) {
            return res.send("");
          } else {
            return console.error(err);
          }
         });
      });
     },
    messageDelete:  function(req, res){
      return models.message.findById(req.params.id, function (err, data) {
        return data.remove(function(err){
          if (!err) {
            return res.send("");
          } else {
            return console.error(err);
          }
         });
      });
     },
     imageDelete:  function(req, res){
      return models.image.findById(req.params.id, function (err, data) {
        if(!err && data){
          var imageLocation = path.normalize(__dirname + "/../chrysalis-public/www/img/drawings/" + data.id + data.extension);
          return data.remove(function(err){
            if (!err) {
              if (fs.existsSync(imageLocation)) {
                fs.unlink(imageLocation);
              }
              return res.send("");
            } else {
              return console.error(err);
            }
           });
        }else{
          return res.send("");
        }
      });
     },
     cardDelete:  function(req, res){
      return models.card.findById(req.params.id, function (err, data) {
        return data.remove(function(err){
          if (!err) {
            return res.send("");
          } else {
            return console.error(err);
          }
         });
      });
     },
    tagPost:  function(req, res){
        var newTag = new models.tag(req.body);
        newTag.save(function (err) {
          if (err) {
            return console.log(err);
          }
        });
        return res.send(newTag);
    },
    tagIdGet: function (req, res){
      return models.tag.findById(req.params.id, function (err, data) {
        if (!err) {
          return res.send(data);
        } else {
          return console.error(err);
        }
      });
    },
    tagNameGet: function (req, res){
      return models.tag.find({"name" : req.params.name}, function (err, data) {
        if (!err) {
          return res.send(data);
        } else {
          return console.error(err);
        }
      });
    },
    tagGet: function(req, res){
      return models.tag
        .find("")
        .sort("name")
        .exec(function(err, data){
          if (!err){ 
            return res.send(data)
          }
          else{
             return console.error(err);
          }
        }); 
    },
    imagePost: function(req, res){
      var newImage = new models.image(req.body);
      newImage.save(function (err) {
        if (err) {
          return console.log(err);
        }
      });
      return res.send(newImage);
    },
    imageIdGet: function (req, res){
      return models.image.findById(req.params.id, function (err, data) {
        if (!err) {
          return res.send(data);
        } else {
          return console.error(err);
        }
      });
    },
    imageGet: function(req, res){
      return models.image.find("", function(err, data){
        if (!err){ 
          return res.send(data)
        }
        else{
           return console.error(err);
        }

      }); 
    },
    cardPost: function(req, res){
      var newCard = new models.card(req.body);
      newCard.save(function (err) {
        if (err) {
          return console.log(err);
        }
      });
      return res.send(newCard);
    },
    cardIdGet: function (req, res){
      return models.card.findById(req.params.id, function (err, data) {
        if (!err) {
          return res.send(data);
        } else {
          return console.error(err);
        }
      });
    },
    cardGet: function(req, res){
      return models.card.find("", function(err, data){
        if (!err){ 
          return res.send(data)
        }
        else{
           return console.error(err);
        }

      }); 
    },
    messagePost: function(req, res){
      var newMessage = new models.message(req.body);
      newMessage.save(function (err) {
        if (err) {
          return console.log(err);
        }
      });
      return res.send(newMessage);
    },
    messageIdGet: function (req, res){
      return models.message.findById(req.params.id, function (err, data) {
        if (!err) {
          return res.send(data);
        } else {
          return console.error(err);
        }
      });
    },
    messageGet: function(req, res){
      return models.message.find("", function(err, data){
        if (!err){ 
          return res.send(data)
        }
        else{
           return console.error(err);
        }

      }); 
    }
  }
};