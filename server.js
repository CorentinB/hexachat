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
var serverPort = process.env.HEXACHAT_PORT || 3000;
http.listen(serverPort, function(){
  console.log('\n----------------------------------------------'.rainbow.bold);
  console.log('\nServer is listening on : '.rainbow.bold + ('http://localhost:'+serverPort+'\n').green.bold);
  console.log('----------------------------------------------\n'.rainbow.bold);
});

// List for connected users
var users = [];
// Latest messages
var messages = [];
// List users while typing
var typingUsers = [];

// Connection checking
io.on('connection', function(socket){
      // Variable for connected user
      var loggedUser;

      // Emission d'un événement "user-login" pour chaque utilisateur connecté
      for (i = 0; i < users.length; i++) {
        socket.emit('user-login', users[i]);
      }

      // Emission d'un événement "chat-message" pour chaque message de l'historique
      for (i = 0; i < messages.length; i++) {
        if (messages[i].username !== undefined) {
          socket.emit('chat-message', messages[i]);
        } else {
          socket.emit('service-message', messages[i]);
        }
      }

      // Déconnexion d'un utilisateur : broadcast d'un 'service-message'
      socket.on('disconnect', function () {
        if (loggedUser !== undefined) {
          console.log('User disconnected : '.red.bold + loggedUser.username.red);
          var serviceMessage = {
            text: 'User "' + loggedUser.username + '" disconnected',
            type: 'logout'
          };
          socket.broadcast.emit('service-message', serviceMessage);
          // Suppression de la liste des connectés
          var userIndex = users.indexOf(loggedUser);
          if (userIndex !== -1) {
            users.splice(userIndex, 1);
          }
          // Ajout du message à l'historique
          messages.push(serviceMessage);
          // Emission d'un 'user-logout' contenant le user
          io.emit('user-logout', loggedUser);
          // Si jamais il était en train de saisir un texte, on l'enlève de la liste
          var typingUserIndex = typingUsers.indexOf(loggedUser);
          if (typingUserIndex !== -1) {
            typingUsers.splice(typingUserIndex, 1);
          }
          }
      });

      ////////////////////////////////////////////////////
      //  Connexion d'un utilisateur via le formulaire  //
      ////////////////////////////////////////////////////

      socket.on('user-login', function (user, callback) {
        // Vérification que l'utilisateur n'existe pas
        var userIndex = -1;
        for (i = 0; i < users.length; i++) {
          if (users[i].username === user.username) {
            userIndex = i;
          }
        }
        loggedUser = user;
        if (loggedUser !== undefined && userIndex === -1) { // S'il est bien nouveau
          // Sauvegarde de l'utilisateur et ajout à la liste des connectés
          users.push(loggedUser);
          // Envoi des messages de service
          console.log('User connected : '.green.bold + loggedUser.username.green);
          var userServiceMessage = {
            text: 'You logged in as "' + loggedUser.username + '"',
            type: 'login'
          };
          var broadcastedServiceMessage = {
            text: 'User "' + loggedUser.username + '" logged in',
            type: 'login'
          };
          socket.emit('service-message', userServiceMessage);
          socket.broadcast.emit('service-message', broadcastedServiceMessage);
          messages.push(broadcastedServiceMessage);
          // Emission de 'user-login' et appel du callback
          io.emit('user-login', loggedUser);
          callback(true);
        } else {
          callback(false);
        }
      });

      /**
       * Réception de l'événement 'chat-message' et réémission vers tous les utilisateurs
       */
      socket.on('chat-message', function (message) {
        message.username = loggedUser.username;
        io.emit('chat-message', message);
        messages.push(message);
        if (messages.length > 150) {
          messages.splice(0, 1);
        }
      });
      /**
       * Réception de l'événement 'start-typing'
       * L'utilisateur commence à saisir son message
       */
      socket.on('start-typing', function () {
        // Ajout du user à la liste des utilisateurs en cours de saisie
        if (typingUsers.indexOf(loggedUser) === -1) {
          typingUsers.push(loggedUser);
        }
        io.emit('update-typing', typingUsers);
      });

      /**
       * Réception de l'événement 'stop-typing'
       * L'utilisateur a arrêter de saisir son message
       */
      socket.on('stop-typing', function () {
        var typingUserIndex = typingUsers.indexOf(loggedUser);
        if (typingUserIndex !== -1) {
          typingUsers.splice(typingUserIndex, 1);
        }
        io.emit('update-typing', typingUsers);
      });
    });
