from django.db.models.signals import pre_delete, post_save, m2m_changed
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from .models import Project
from chats.models import ProjectChat
from notifications.models import Notification
from notifications.serializers import NotificationSerializer

User = get_user_model()

@receiver(pre_delete, sender=User)
def handle_creator_deletion(sender, instance, **kwargs):
    """Handles ownership transfer when a creator's user account is deleted."""
    projects = Project.objects.filter(creator=instance)
    for project in projects:
        project.transfer_ownership()

@receiver(post_save, sender=Project)
def create_chat_for_project(sender, instance, created, **kwargs):
    """Create a chat for the project whenever a project is created."""
    if created:
        ProjectChat.objects.create(project=instance)

@receiver(m2m_changed, sender=Project.collaborators.through)
def notify_collaborator_invite(sender, instance, action, pk_set, **kwargs):
    """Create notifications for new collaborators added to project."""
    if action == 'post_add':
        for user_pk in pk_set:
            try:
                invited_user = User.objects.get(pk=user_pk)
                notification = Notification.objects.create(
                    user=invited_user,
                    project=instance,
                    notification_type='INVITE',
                    message=f"You have been invited to the project: {instance.title}"
                )

                channel_layer = get_channel_layer()

                async_to_sync(channel_layer.group_send)(
                    f"notifications_{notification.user.id}",
                    {
                        "type": "send_notification",
                        "data": NotificationSerializer(notification).data,
                    }
                )
            except User.DoesNotExist:
                pass