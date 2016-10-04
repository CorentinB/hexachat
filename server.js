// Tout d'abord on initialise notre application avec le framework Express
// et la bibliothèque http integrée à node.
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var colour = require('colour');

// On gère les requêtes HTTP des utilisateurs en leur renvoyant les fichiers du dossier 'public'
app.use("/", express.static(__dirname + "/public"));

// On lance le serveur en écoutant les connexions arrivant sur le port 3000
http.listen(3000, function(){
  console.log('\n----------------------------------------------'.rainbow.bold);
  console.log('\nServer is listening on : '.rainbow.bold + 'http://localhost:3000\n'.green.bold);
  console.log('----------------------------------------------\n'.rainbow.bold);
});

//On check si un user se connecte
io.on('connection', function(socket){
      /**
       * Utilisateur connecté à la socket
       */
      var loggedUser;

      /**
       * Déconnexion d'un utilisateur : broadcast d'un 'service-message'
       */
      socket.on('disconnect', function () {
        if (loggedUser !== undefined) {
          console.log('User disconnected : '.red.bold + loggedUser.username.red);
          var serviceMessage = {
            text: 'User "' + loggedUser.username + '" disconnected',
            type: 'logout'
          };
          socket.broadcast.emit('service-message', serviceMessage);
        }
      });

      /**
       * Connexion d'un utilisateur via le formulaire :
       *  - sauvegarde du user
       *  - broadcast d'un 'service-message'
       */
      socket.on('user-login', function (user) {
        loggedUser = user;
        if (loggedUser !== undefined) {
          console.log('User connected : '.green.bold + loggedUser.username.green);
          var serviceMessage = {
            text: 'User "' + loggedUser.username + '" logged in',
            type: 'login'
          };
          socket.broadcast.emit('service-message', serviceMessage);
        }
      });

      /**
       * Réception de l'événement 'chat-message' et réémission vers tous les utilisateurs
       */
      socket.on('chat-message', function (message) {
        message.username = loggedUser.username;
        io.emit('chat-message', message);
        console.log('Message from '.green.bold + loggedUser.username.green.bold + ' : '.green.bold + message.text.green);
      });
    });
