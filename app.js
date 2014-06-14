var express = require('express'),
  nodemailer = require("nodemailer"),
  passport = require('passport'), 
  LocalStrategy = require('passport-local').Strategy,
  mongoose = require("mongoose"),
  bcrypt = require("bcrypt-nodejs"),
  fs = require("fs"),
  path = require("path");

var format = require('util').format;

var bson = require("bson");
var app = express();
var helloName = require("./server/helloName");
var api = require("./server/api");

mongoose.connect("54.187.178.36:27017/chrysalis");
var db = mongoose.connection;

var models = require(__dirname + "/server/Model/models")(mongoose);
var endpoints = require(__dirname + "/server/endpoints")(models, fs, path);
var AdminModel = require(__dirname + "/server/Model/Admin")(mongoose);


var transport = nodemailer.createTransport("Gmail",{
    auth: {
        user: "chrysalisecard@gmail.com",
        pass: "dummypassword"
    }
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  AdminModel.findById(id,function(err,user){
    done(err,user);
  });
});
passport.use(new LocalStrategy(
  function(username, password, done) {
    AdminModel.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

// configure Express
app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'ash ketchum' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/chrysalis-public/www'));
  app.use(express.logger());
});

app.post('/admin/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      return res.redirect('/admin.html?error=' + info.message)
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/index.html#/admin/messages');
    });
  })(req, res, next);
});

app.get('/admin/logout', function(req, res){
  req.logout();
  res.redirect('/admin.html');
});

app.get('/secure', ensureAuthenticated, function(req, res){
  return res.send("SECURE");
});

app.get("/api/images/list", api.list);
app.get("/api/tags", endpoints.tagGet);
app.get("/api/tags/:id", endpoints.tagIdGet);
app.get("/api/tags/name/:name", endpoints.tagNameGet);
app.get("/api/cards", endpoints.cardGet);
app.get("/api/cards/:id", endpoints.cardIdGet);
app.get("/api/images", endpoints.imageGet);
app.get("/api/images/:id", endpoints.imageIdGet);
app.get("/api/messages", endpoints.messageGet);
app.get("/api/messages/:id", endpoints.messageIdGet);
app.get("/api/cards/delete/:id", endpoints.cardDelete);
app.get("/api/messages/delete/:id", endpoints.messageDelete);
app.get("/api/images/delete/:id", endpoints.imageDelete);
app.get("/api/tags/delete/:id", endpoints.tagDelete);


app.post("/api/tags/update/:id", endpoints.tagUpdate);
app.post("/api/messages/update/:id", endpoints.messageUpdate);
app.post("/api/cards/update/:id", endpoints.cardUpdate);
app.post("/api/images/update/:id", endpoints.imageUpdate);
app.post("/api/messages", endpoints.messagePost);
app.post("/api/images", endpoints.imagePost);
app.post("/api/cards", endpoints.cardPost);
app.post("/api/tags", endpoints.tagPost);
app.get("/api/messages", api.messages);

app.post("/api/images/upload", function(req, res){
  var data = req.body;
  data.extension = "." + req.files.imageUpload.name.split(".").pop();
  var newImage = new models.image(req.body);
  newImage.save(function (err) {
    if (err) {
      return console.log(err);
    }else{
      fs.readFile(req.files.imageUpload.path, function (err, data) {
        var newPath = __dirname + "\\chrysalis-public\\www\\img\\drawings\\" + newImage.id + newImage.extension;
        fs.writeFile(newPath, data, function (err) {
          if (err) {
            console.log(err);
          }
          res.send(newImage);
          //NEED TO CHANGE LINK TO SINGLE IMAGE EDIT
          res.redirect("/#/admin/image/edit/:id");
        });
      });
    }
  });
});

app.listen(8080, function() {
  console.log("Application started on port 8080!");
});

app.get('/api/cards/send/:id', function(req, res){
  models.card.findById(req.params.id, function (err, data) {
    if (!err) {
            
      var senderName = data.from;
      var senderEmail = data.fromEmail;
      var toEmail = data.toEmail;



      var subject = senderName + " has made a donation to Chrysalis in your name!";
      var text = "Here is the link to your ecard: " +
        "<a href=\"http://54.187.178.36:8080/#/ecard/" +
        req.params.id + "\">Chrysalis ecard</a>";

      var mailOptions = {
        from: senderEmail,
        to: toEmail,
        cc: senderEmail,
        subject: subject,
        html: text
      };

        transport.sendMail(mailOptions, function(error, response){
          if(error){
            res.statusCode = 500;
            res.end();
          }else{
            res.redirect("/#/sent");
          }
        });
   } else {
    return console.error(err);
  }
  });
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/admin.html');
}

