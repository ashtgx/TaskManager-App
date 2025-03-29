from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from .models import ChatMessage
from notifications.models import Notification
from notifications.serializers import NotificationSerializer

User = get_user_model()

@receiver(post_save, sender=ChatMessage)
def notify_new_chat_message(sender, instance, created, **kwargs):
    if not created:
        return
    chat = instance.project_chat
    project = chat.project
    sender_user = instance.sender
    
    recipients = list(project.collaborators.exclude(id=sender_user.id))
    
    if project.creator and project.creator != sender_user:
        if project.creator not in recipients:
            recipients.append(project.creator)
    
    for user in recipients:
        notification = Notification.objects.create(
            user=user,
            project=project,
            notification_type='CHAT',
            message=f"New message in project '{project.title}': {instance.content[:50]}..."
        )
        
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"notifications_{notification.user.id}",
            {
                "type": "send_notification",
                "data": NotificationSerializer(notification).data,
            }
        )