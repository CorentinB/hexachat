/*global io*/
var socket = io();

// Scroll vers le bas de page si l'utilisateur n'est pas remonté pour lire d'anciens messages
function scrollToBottom() {
    if ($(window).scrollTop() + $(window).height() + 2 * $('#messages').find('li').last().outerHeight() >= $(document).height()) {
        $('html, body').animate({ scrollTop: $(document).height() }, 0);
    }
}
$('#chat').hide();
$('#bgvid').show();

//Caractères autorisés et insultes interdites
var caractAllowed = /^[a-z0-9éè]*$/i;
var badWords = /(?:^|\s)(?:bougnoule|cr[éeè]tin|c+o+n+ar+|c+o+n+a+r+d+|c+o+n+a+s+e+|encul.|enflure|f+d+p+|keh|n+t+m+|n.gre|n.gro|p.tasse|p+d+|p+u+t+e+|g+u+e+u+l+e+|t+g+|s+a+l+o+p.|s+a+l+o+p+)(?:\s|$)/i;

var myscroll = $('body'); // Chemin de body (il ne change pas, donc autant ne l'enregistrer qu'une fois)

// Connexion d'un utilisateur
$('#login').find('form').submit(function (e) {
    e.preventDefault();
    var user = {
        username : $('#login').find('input').val().trim()
    };

    if (user.username.length >= 3 && user.username.length <= 12 && caractAllowed.test(user.username) && badWords.test(user.username) === false) { // Si le champ de connexion n'est pas vide
        socket.emit('user-login', user, function(success){
            if(success){
                $('body').removeAttr('id'); // Cache formulaire de connexion
                $('#chat').find('input').focus(); // Focus sur le champ du message
                $('#bgvid').hide();
                $('#chat').show();
                $('#login').hide();
                myscroll.scrollTop(myscroll.get(0).scrollHeight);
            }
        });
    } else if (user.username.length != 0){
        $('#u').effect("shake", {}, "fast");
    }
});

// Detect while typing
var typingTimer;
var isTyping = false;

$('#m').keypress(function () {
    clearTimeout(typingTimer);
    if (!isTyping) {
        socket.emit('start-typing');
        isTyping = true;
    }
});

$('#m').keyup(function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
        if (isTyping) {
            socket.emit('stop-typing');
            isTyping = false;
        }
    }, 500);
});

// Envoi d'un message
$('#chat').find('form').submit(function (e) {
    e.preventDefault();
    var message = {
        text : $('#m').val()
    };
    $('#m').val('');

    if (message.text.trim().length !== 0 && message.text.trim().length <= 199 && badWords.test(message.text) === false) { // Gestion message vide
        socket.emit('chat-message', message);
    } else if (message.text.trim().length !== 0){ // Chat devient temporairement rouge si message incorect
        $("#m").finish().effect("highlight", {color: '#9E2E29'}, 1000);
    }
    $('#chat').find('input').focus(); // Focus sur le champ du message
});

// Réception d'un message AVEC PROTECTION CONTRE FAILLE XSS
socket.on('chat-message', function (message) {
    var $line = $('<li>')
            .append($('<span class="username">').text(message.username))
            .append(' ')
            .append($('<span>').text(message.text));
    $('#messages').append($line);

     myscroll.scrollTop(myscroll.get(0).scrollHeight);
});

// Réception d'un message de service
socket.on('service-message', function (message) {
    $('#messages').append($('<li class="' + message.type + '">').html('<span class="info">Information</span> ' + message.text));
    scrollToBottom();
});

/*************************/
/** GESTION LISTE USERS **/
/*************************/

// Connexion d'un nouvel utilisateur
socket.on('user-login', function (user) {
    $('#users').append($('<li class="' + user.username + ' new">').html(user.username + '<span class="typing">Typing...</span>'));
    setTimeout(function () {
        $('#users').find('li.new').removeClass('new');
    }, 1000);
});

// Déconnexion d'un utilisateur
socket.on('user-logout', function (user) {
    var selector = '#users li.' + user.username;
    $(selector).remove();
});

// Other users typing
socket.on('update-typing', function (typingUsers) {
    $('#users').find('li span.typing').hide();
    for (i = 0; i < typingUsers.length; i++) {
        $('#users').find('li.' + typingUsers[i].username + ' span.typing').show();
    }
});
