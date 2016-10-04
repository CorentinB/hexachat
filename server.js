// Tout d'abord on initialise notre application avec le framework Express
// et la bibliothèque http integrée à node.
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// On gère les requêtes HTTP des utilisateurs en leur renvoyant les fichiers du dossier 'public'
app.use("/", express.static(__dirname + "/public"));

// On lance le serveur en écoutant les connexions arrivant sur le port 3000
http.listen(3000, function(){
  console.log('Server is listening on http://YOUR_URL:3000');
});

//On check si un user se connecte
io.on('connection', function(socket){
    var user;
    /**
     * Connexion d'un utilisateur via le formulaire
     */
    socket.on('user-login', function (loggedUser) {
      console.log('user logged in : ' + loggedUser.username);
      user = loggedUser;
    });
    //PROBLEME ICI (?)    //Réception de l'event chat-message et réémission vers tous les utilisateurs
    socket.on('chat-message', function(message, loggedUser){
        message.username = user.username; // On intègre le pseudo
        console.log(message.username);
        io.emit('chat-message', message);
        console.log('Message de : ' + user.username);
    });
});
