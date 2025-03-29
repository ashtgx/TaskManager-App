from __future__ import absolute_import, unicode_literals
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from boards.models import GanttTask
from notifications.models import Notification
from notifications.serializers import NotificationSerializer

@shared_task
def check_gantt_deadline_notifications():
    """
    Checks for Gantt tasks with deadlines approaching within the next 24 hours,
    and creates a notification for the assigned user (and optionally project collaborators).
    """
    today = timezone.now().date()
    upcoming_deadline = today + timedelta(days=1)
    
    # Fetch tasks with an end_date between today and upcoming_deadline and that haven't been notified yet.
    tasks = GanttTask.objects.filter(
        end_date__gte=today,
        end_date__lte=upcoming_deadline,
        deadline_notification_sent=False
    )
    
    for task in tasks:
        if task.assigned_to:
            # Create a notification for the assigned user
            notification = Notification.objects.create(
                user=task.assigned_to,
                project=task.gantt_board.project,
                notification_type='DEADLINE',
                message=f"Deadline approaching for task '{task.title}' in project '{task.gantt_board.project.title}'."
            )

            channel_layer = get_channel_layer()

            async_to_sync(channel_layer.group_send)(
                f"notifications_{notification.user.id}",
                {
                    "type": "send_notification",
                    "data": NotificationSerializer(notification).data,
                }
            )
        
        # Optional: notify project collaborators (and/or creator)
        collaborators = list(task.gantt_board.project.collaborators.all())
        if task.gantt_board.project.creator and task.gantt_board.project.creator != task.assigned_to:
            collaborators.append(task.gantt_board.project.creator)
        
        for collaborator in collaborators:
            # Avoid duplicate notification if collaborator is the assigned user
            if task.assigned_to and collaborator == task.assigned_to:
                continue
            notification = Notification.objects.create(
                user=collaborator,
                project=task.gantt_board.project,
                notification_type='DEADLINE',
                message=f"Deadline approaching for task '{task.title}' in project '{task.gantt_board.project.title}'."
            )

            channel_layer = get_channel_layer()

            async_to_sync(channel_layer.group_send)(
                f"notifications_{notification.user.id}",
                {
                    "type": "send_notification",
                    "data": NotificationSerializer(notification).data,
                }
            )
        
        # Mark task as notified to avoid duplicate notifications
        task.deadline_notification_sent = True
        task.save()