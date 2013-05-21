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
    
    if (msg.username == 'pseudo' ||
        msg.username === null)
      return;
    
    $search.val('');
    $search.focus();
    
    addMessage(msg);
    $.post('/messages', msg);
  });
  
  $('#username').on('blur keydown', function(e) {
    var $elem = $(this);
    
    if (e.which != 13 && e.which != 0)
      return;
    
    e.preventDefault();
    
    if (!$elem.text())
      $elem.text('pseudo');
    
    if (e.type != 'blur') {
      $elem.blur();
      $('#search').focus();
    }
    
    $.cookie('username', $elem.text(), {expires: 365});
    
    if ($.cookie('username') == 'pseudo')
      $('#search').attr('placeholder', 'Veuillez changer votre pseudo →');
    else
      $('#search').removeAttr('placeholder');
  });
  
  $(document).keydown(function(e) {
    if (e.which == 27)
      location.replace('//www.google.be/');
  });
});
