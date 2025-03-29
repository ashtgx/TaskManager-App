from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatMessageViewSet

router = DefaultRouter()
router.register(r"chat-messages", ChatMessageViewSet, basename='chat-messages')

urlpatterns = [
    path("projects/<int:project_id>/", include(router.urls)), 
]