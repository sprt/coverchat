from os import environ

from bottle import (abort, default_app, get, JSONPlugin, post, request,
                    response, run, view)
from pusher import Pusher

@get('/')
@view('chat')
def get_chat():
    return {'app_version': environ['CURRENT_VERSION_ID'].split('.')[0],
            'dev': environ['SERVER_SOFTWARE'].startswith('Development'),
            'username': request.get_cookie('username', 'pseudo')}

@post('/messages')
def post_messages():
    username = request.get_cookie('username', 'pseudo')
    content = request.forms.get('content')
    socket_id = request.forms.get('socket_id')
    
    if username == 'pseudo' or not (content and socket_id):
        abort(400)
    
    p = Pusher(app_id='29556', key='e44daeeff8725fc3f830',
               secret='e009ec85952f4c4810e1')
    p['chat'].trigger('message', {'username': username, 'content': content},
                      socket_id)

@get('/_ah/warmup')
def get_warmup():
    pass

app = default_app()
run(app=app, server='gae')
