from os import environ
from uuid import uuid4

from google.appengine.api import channel
from google.appengine.ext import ndb

from bottle import abort, default_app, get, post, request, response, run, view

class Message(ndb.Model):
    username = ndb.StringProperty(required=True, indexed=False)
    content = ndb.StringProperty(required=True, indexed=False)
    date = ndb.DateTimeProperty(auto_now_add=True)

class Client(ndb.Model):
    token = ndb.StringProperty(indexed=False)

def get_json_messages():
    messages = Message.query().order(-Message.date).fetch(4)
    messages_json = []
    
    for msg in messages:
        msg_dict = msg.to_dict()
        msg_dict['date'] = msg.date.isoformat()
        messages_json.append(msg_dict)
    
    return messages_json

@ndb.transactional
def update_or_insert_client(cid, token):
    key = ndb.Key(Client, cid)
    client = key.get()
    
    if client:
        client.token = token
    else:
        client = Client(key=key, token=token)
    
    client.put()

@get('/')
@view('chat')
def get_chat():
    from json import dumps as json_dumps
    
    client_id = request.get_cookie('cid')
    
    if not client_id:
        client_id = str(uuid4())
        response.set_cookie('cid', client_id, max_age=86400 * 365)
    
    token = channel.create_channel(client_id)
    update_or_insert_client(client_id, token)
    
    username = request.get_cookie('usr', 'pseudo')
    
    return {'app_version': environ['CURRENT_VERSION_ID'].split('.')[0],
            'messages': get_json_messages(),
            'token': token,
            'username': username}

@post('/messages')
def post_messages():
    from json import dumps as json_dumps
    
    username = request.forms.get('username')
    content = request.forms.get('content')
    
    if not (username and content) or username == 'pseudo':
        abort(400)
    
    # Add the message to the database
    msg_key = Message(username=username, content=content).put()
    msg = msg_key.get()
    
    # Send the message to the clients
    for client in Client.query():
        client_id = client.key.id()
        if client_id != request.get_cookie('cid'):  # Don't send to oneself
            msg_json = msg.to_dict()
            msg_json['date'] = msg.date.isoformat()
            channel.send_message(client_id, json_dumps(msg_json))

@post('/_ah/channel/connected/')
def post_connected():
    pass

@post('/_ah/channel/disconnected/')
def post_disconnected():
    ndb.Key(Client, request.forms.get('from')).delete()

@get('/_ah/warmup')
def get_warmup():
    pass

app = default_app()
run(app=app, debug=True, server='gae')
