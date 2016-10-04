var socket = io();

$('form').submit(function(e) {
    e.preventDefault(); // On évite le recharchement de la page lors de la validation du formulaire
    // On crée notre objet JSON correspondant à notre message
    var message = {
        text : $('#m').val()
    }
    $('#m').val(''); // On vide le champ texte
    if (message.text.trim().length !== 0) { // Gestion message vide
      socket.emit('chat-message', message);
    }
    $('#chat input').focus(); // Focus sur le champ du message
});

// Réception d'un message
socket.on('chat-message', function (message, loggedUser) {
  $('#messages').append($('<li>').html('<span class="username">' + message.username + '</span> ' + message.text));
});

/**
 * Connexion d'un utilisateur
 */
$('#login form').submit(function (e) {
  e.preventDefault();
  var user = {
    username : $('#login input').val().trim()
  };
  if (user.username.length > 0) { // Si le champ de connexion n'est pas vide
    socket.emit('user-login', user);
    $('body').removeAttr('id'); // Cache formulaire de connexion
    $('#chat input').focus(); // Focus sur le champ du message
  }
});
