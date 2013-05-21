$(function() {
  var pusher = new Pusher('e44daeeff8725fc3f830');
  var channel = pusher.subscribe('chat');
  
  pusher.connection.bind('connected', function() {
    state.socketId = pusher.connection.socket_id;
  });
  
  channel.bind('message', function(data) {
    addMessage(data);
  });
  
  function addMessage(msg) {
    state.messages = state.messages.slice(0, 3);
    state.messages.unshift(msg);
    updateChatbox();
  }
  
  function updateChatbox() {  
    var $msgList = $('#messages ul');
    $msgList.empty();
    
    $.each(state.messages, function(i, msg) {
      $('<li>')
        .text(msg.content)
        .prepend($('<span class="username">').text(msg.username))
        .appendTo($msgList);
    });
    
    $('#messages').show();
  }
  
  $('#message-form').submit(function(e) {
    e.preventDefault();
    
    var $search = $('#search'),
        msg = {content: $search.val(),
               socket_id: state.socketId,
               username: $.cookie('username')};
    
    if (msg.content == '')
      return;
    
    if (msg.username == 'pseudo' || msg.username === null)
      return;
    
    $search.val('');
    $search.focus();
    
    addMessage(msg);
    $.post('/messages', msg);
  });
  
  $('#username').on('blur keydown', function(e) {
    var $search = $('#search'),
        $username = $(this),
        username = $username.text();
    
    if (e.which != 13 && e.which != 0)
      return;
    
    e.preventDefault();
    
    if (username == '' || username.toLowerCase() == 'pseudo') {
      username = $.cookie('username') || 'pseudo';
      $username.text(username);
    }
    
    if (e.type != 'blur') { // pressed Enter
      $username.blur();
      $search.focus();
    }
    
    if (username != 'pseudo') {
      $search.attr('disabled', false);
      $search.removeAttr('placeholder');
      $.cookie('username', username, {expires: 365});
    }
  });
  
  $(document).keydown(function(e) {
    if (e.which == 27)
      location.replace('//www.google.be/');
  });
  
  if ($.cookie('username') == 'pseudo' || $.cookie('username') === null) {
    $('#search').blur();
    $('#search').attr('disabled', true);
  }
});
