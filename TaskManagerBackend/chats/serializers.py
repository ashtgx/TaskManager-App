from rest_framework import serializers
from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'project_chat', 'sender', 'content', 'file', 'original_filename', 'timestamp']
        read_only_fields = ['project_chat', 'sender', 'timestamp']
        extra_kwargs = {
            'content': {'required': False},
            'file': {'required': False}
        }