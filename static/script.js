/*jslint browser: true, unparam: true, white: true, indent: 2, maxlen: 80 */
/*global $: true, Pusher: true, state: true */
(function() {
  'use strict';
  
  function updateChatbox() {
    var $msgList = $('#messages ul').empty();
    
    $.each(state.messages, function(i, msg) {
      $('<li>')
        .text(msg.content)
        .prepend($('<span class="username">').text(msg.username))
        .appendTo($msgList);
    });
    
    $('#messages').show();
  }
  
  function addMessage(msg) {
    state.messages = state.messages.slice(0, 3);
    state.messages.unshift(msg);
    updateChatbox();
  }
  
  $('#message-form').submit(function(e) {
    e.preventDefault();
    
    var $search = $('#search'),
        msg = {
          content: $search.val(),
          username: $.cookie('username')
        };
    
    if (msg.content === '' || msg.username.toLowerCase() === 'pseudo' ||
        msg.username === null) {
      return;
    }
    
    $search.val('');
    $search.focus();
    
    addMessage(msg);
    channel.trigger('client-message', msg);
  });
  
  $('#username').on('blur keydown', function(e) {
    console.log(e)
    if (e.type === 'keydown' && e.which !== 13 && e.which !== 0) {
      return;
    }
    
    e.preventDefault();
    
    var $search = $('#search'),
        $username = $(this),
        username = $username.text();
    
    if (username === '' || username.toLowerCase() === 'pseudo') {
      username = $.cookie('username') || 'pseudo';
      $username.text(username);
    }
    
    if (e.type !== 'blur') { // pressed Enter
      $username.blur();
      $search.focus();
    }
    
    if (username !== 'pseudo') {
      $search.attr('disabled', false);
      $search.removeAttr('placeholder');
      $.cookie('username', username, {expires: 365});
    }
  });
  
  $(document).keydown(function(e) {
    if (e.which === 27) {
      location.replace('//www.google.be/');
    }
  });
  
  var pusher = new Pusher('e44daeeff8725fc3f830'),
      channel = pusher.subscribe('private-chat');
  
  channel.bind('client-message', function(data) {
    addMessage(data);
  });
}());
