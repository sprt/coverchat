from bottle import (abort, default_app, get, JSONPlugin, post, request,
                    response, run, view)

import config

@get('/')
@view('chat')
def get_chat():
    from os import environ
    
    return {'app_version': environ['CURRENT_VERSION_ID'].split('.')[0],
            'dev': environ['SERVER_SOFTWARE'].startswith('Development'),
            'username': request.get_cookie('username', 'pseudo')}

@post('/pusher/auth')
def post_pusher_auth():
    from pusher import Pusher
    
    channel_name = request.forms.get('channel_name')
    socket_id = request.forms.get('socket_id')
    
    p = Push(app_id=config.PUSHER_APP_ID, key=config.PUSHER_KEY,
    	     secret=PUSHER_SECRET)
    auth = p[channel_name].authenticate(socket_id)
    
    return auth

@get('/_ah/warmup')
def get_warmup():
    pass

app = default_app()
run(app=app, server='gae')
