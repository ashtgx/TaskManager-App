from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from projects.models import Project

User = get_user_model()

# Create your models here.
class ProjectChat(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name="chat")

    def __str__(self):
        return f"Chat for {self.project.title}"

class ChatMessage(models.Model):
    project_chat = models.ForeignKey(ProjectChat, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    file = models.FileField(upload_to="chat_files/", null=True, blank=True)
    original_filename = models.CharField(max_length=255, null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]} in {self.project_chat.project.title} "