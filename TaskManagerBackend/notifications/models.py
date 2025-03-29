from django.db import models
from django.contrib.auth import get_user_model
from projects.models import Project

User = get_user_model()

# Create your models here.
class Notification(models.Model):
    NOTIF_TYPE_CHOICES = [
        ('INVITE', 'Project Invite'),
        ('CHAT', 'New Chat Message'),
        ('DEADLINE', 'Gantt Deadline'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NOTIF_TYPE_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} from {self.project.title} - {self.notification_type}"