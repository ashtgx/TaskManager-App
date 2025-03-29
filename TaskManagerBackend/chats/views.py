from rest_framework import viewsets, permissions
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.shortcuts import get_object_or_404
from .models import ProjectChat
from .serializers import ChatMessageSerializer

# Create your views here.
class ChatMessageViewSet(viewsets.ModelViewSet):
    
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        project_chat = get_object_or_404(ProjectChat, project__id=project_id)  # Ensure chat exists
        return project_chat.messages.all()

    def perform_create(self, serializer):
        project_id = self.kwargs['project_id']
        project_chat = get_object_or_404(ProjectChat, project__id=project_id)  # Get the chat for this project
        original_filename = None
        if 'file' in self.request.FILES:
            original_filename = self.request.FILES['file'].name
        message = serializer.save(project_chat=project_chat, sender=self.request.user, original_filename=original_filename)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{project_id}",
            {
                "type": "chat.message",
                "message": message.content,
                "sender": message.sender.username,
                "timestamp": message.timestamp.strftime("%H:%M"),
                "file": message.file.url if message.file else None,
                "original_filename": message.original_filename if message.file else None
            },
        )