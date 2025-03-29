import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user', None)

        if not self.user or self.user.is_anonymous:
            await self.close()
            return
        self.group_name = f"notifications_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Optionally send unread notifications
        notifications = await self.get_unread_notifications()
        for notif in notifications:
            await self.send(text_data=json.dumps({
                'notification_type': notif['notification_type'],
                'message': notif['message'],
                'created_at': str(notif['created_at'])
            }))

    async def disconnect(self, close_code):
        if hasattr(self, "group_name") and self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('action') == 'mark_read':
            notif_id = data.get('id')
            await self.mark_notification_read(notif_id)

    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def get_unread_notifications(self):
        return list(Notification.objects.filter(user=self.user, is_read=False).values(
            'notification_type', 'message', 'created_at'
        ))

    @database_sync_to_async
    def mark_notification_read(self, notif_id):
        try:
            notif = Notification.objects.get(id=notif_id, user=self.user)
            notif.is_read = True
            notif.save()
        except Notification.DoesNotExist:
            pass