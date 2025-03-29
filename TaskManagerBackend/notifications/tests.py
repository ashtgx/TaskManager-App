from datetime import timedelta, date
from django.test import TestCase, TransactionTestCase
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from channels.testing import WebsocketCommunicator
from rest_framework_simplejwt.tokens import AccessToken
from channels.routing import URLRouter
from notifications.routing import websocket_urlpatterns
from TaskManagerBackend.middleware import JWTAuthMiddleware
application = JWTAuthMiddleware(URLRouter(websocket_urlpatterns))
from .models import Notification
from boards.models import GanttBoard, GanttTask
from projects.models import Project

User = get_user_model()

class NotificationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="notifuser", email="notifuser@mail.com", password="pass123")
        self.other = User.objects.create_user(username="other", email="other@email.com", password="pass456")
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(title="Deadline Project", creator=self.user)
        self.gantt_board = GanttBoard.objects.create(title="Gantt", project=self.project)
        self.task = GanttTask.objects.create(
            gantt_board=self.gantt_board,
            title="Deadline Task",
            assigned_to=self.user,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=1),
        )

        self.notification = Notification.objects.create(
            user=self.user,
            project=self.project,
            message="Test Notification",
            notification_type="CHAT"
        )
        self.client.force_authenticate(user=self.user)

    def test_get_user_notifications(self):
        url = "/api/notifications/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1, msg="Expected at least one notification.")
        self.assertEqual(response.data[0]["message"], "Test Notification")

    def test_gantt_deadline_notification_created(self):
        # Simulate what a Celery task would do
        GanttTask.objects.filter(id=self.task.id).update(end_date=date.today() + timedelta(hours=20))

        Notification.objects.create(
            user=self.user,
            project=self.project,
            message=f"Task '{self.task.title}' is due soon!",
            notification_type="DEADLINE"
        )

        notifications = Notification.objects.filter(user=self.user, notification_type="DEADLINE")
        self.assertEqual(notifications.count(), 1)
        self.assertIn("due soon", notifications.first().message)


class NotificationConsumerTests(TransactionTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = User.objects.create_user(username="notifyuser", password="testpass", email="notify@example.com")
        cls.project = Project.objects.create(title="Notif Test Project", creator=cls.user)
        cls.notification = Notification.objects.create(
            user=cls.user,
            project=cls.project,
            notification_type="CHAT",
            message="Real-time test",
            is_read=False
        )
    async def test_mark_notification_as_read(self):
        token = str(AccessToken.for_user(self.user))
        communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await communicator.send_json_to({
            "action": "mark_read",
            "id": self.notification.id
        })

        await communicator.receive_nothing()

        await database_sync_to_async(self.notification.refresh_from_db)()
        self.assertTrue(self.notification.is_read)

        await communicator.disconnect()

    async def test_receive_unread_notifications_on_connect(self):
        user = await database_sync_to_async(User.objects.create_user)(username="notify_connect", password="pass", email="notify_connect@example.com")
        project = await database_sync_to_async(Project.objects.create)(title="Notif Unread Test", creator=user)
        await database_sync_to_async(Notification.objects.create)(
            user=user,
            project=project,
            notification_type="CHAT",
            message="Unread notif",
            is_read=False
        )
        token = str(AccessToken.for_user(user))
        communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        response = await communicator.receive_json_from()
        self.assertEqual(response["message"], "Unread notif")
        self.assertEqual(response["notification_type"], "CHAT")

        await communicator.disconnect()

    async def test_send_notification_to_group(self):
        user = await database_sync_to_async(User.objects.create_user)(username="send_notif", password="pass", email="send_notif@example.com")
        token = str(AccessToken.for_user(user))
        communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f"notifications_{user.id}",
            {
                "type": "send_notification",
                "data": {
                    "notification_type": "GANTT",
                    "message": "Upcoming deadline!",
                    "created_at": "2025-03-25T12:00:00"
                }
            }
        )

        response = await communicator.receive_json_from()
        self.assertEqual(response["notification_type"], "GANTT")
        self.assertEqual(response["message"], "Upcoming deadline!")

        await communicator.disconnect()