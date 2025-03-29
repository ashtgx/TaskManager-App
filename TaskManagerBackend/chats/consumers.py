import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from .models import ProjectChat, ChatMessage

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handles new WebSocket connections."""
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.room_group_name = f"chat_{self.project_id}"

        # Join the chat group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Load previous chat messages
        messages = await self.get_previous_messages()
        for message in messages:
            await self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': f"{message['content']}" if message['content'] else None,
                'sender': message['sender__username'],
                'timestamp': message['timestamp'].strftime("%H:%M"),
                'file': f"/media/{message['file']}" if message['file'] else None,
                'original_filename': message.get('original_filename')
            }))

    async def disconnect(self, close_code):
        """Handles WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Handles incoming messages from WebSocket."""
        data = json.loads(text_data)
        message_content = data['content']
        sender = self.scope['user']
        file = data.get('file', None)

        # Save the message to the database
        saved_message = await self.save_message(sender, message_content, file)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': saved_message.content if saved_message.content else None,
                'sender': sender.username,
                'timestamp': saved_message.timestamp.strftime("%H:%M"),
                'file': saved_message.file.url if saved_message.file else None
            }
        )

    async def chat_message(self, event):
        """Handles sending messages to WebSocket clients."""
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'timestamp': event['timestamp'],
            'file': event['file'],
            'original_filename': event.get('original_filename')
        }))

    @database_sync_to_async
    def get_previous_messages(self):
        
        """Fetch previous messages from the database asynchronously."""
        project_chat = ProjectChat.objects.filter(project_id=self.project_id).first()
        if not project_chat:
            return []
        return list(project_chat.messages.all().order_by("timestamp").values("content", "sender__username", "timestamp", "file", "original_filename"))

    @database_sync_to_async
    def save_message(self, sender, content, file):
        """Saves a new message to the database."""
        project_chat = ProjectChat.objects.filter(project_id=self.project_id).first()
        if not project_chat:
            return None
        
        return ChatMessage.objects.create(
            project_chat=project_chat,
            sender=sender,
            content=content,
            file=file
        )