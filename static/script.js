var channel = new goog.appengine.Channel(state.token),
    socket = channel.open();

socket.onopen = function () {
  console.info('Socket open');
};

socket.onmessage = function (message) {
  console.log('Socket message:', message);
  var msg = JSON.parse(message.data);
  addMessage(msg);
};

socket.onerror = function (error) {
  console.error('Socket error:', error);
};

socket.onclose = function (error) {
  console.info('Socket closed');
};

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
}

function updatePlaceholder() {
  if (state.username == 'pseudo')
    $('#search').attr('placeholder', 'Veuillez changer votre pseudo →');
  else
    $('#search').removeAttr('placeholder');
}

$('#message-form').submit(function(e) {
  e.preventDefault();
  
  var $search = $('#search'),
      msg = {username: state.username, content: $search.val()};
  
  if (msg.content == '')
    return;
  
  if (msg.username == 'pseudo')
    return;
  
  $search.val('');
  $search.focus();
  
  addMessage(msg);
  $.post('/messages', msg);
});

$('#username').on('blur keypress', function(e) {
  var $elem = $(this);
  
  if (e.which != 13 && e.which != 0)
    return;
  
  e.preventDefault();
  
  if (!$elem.text())
    $elem.text('pseudo');
  
  if (e.type != 'blur')
    $elem.blur();
  
  state.username = $elem.text();
  updatePlaceholder();
  
  $.cookie('usr', state.username, {expires: 365});
});

updatePlaceholder();
