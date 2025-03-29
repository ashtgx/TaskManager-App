from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import NotificationSerializer
from .models import Notification
from .serializers import NotificationSerializer

# Create your views here.
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"detail": "All notifications marked as read."})
    
    def perform_create(self, serializer):
        notification = serializer.save(user=self.request.user)

        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"notifications_{notification.user.id}",
            {
                "type": "send_notification",
                "data": NotificationSerializer(notification).data,
            }
    )