import json
from rest_framework.test import APITestCase
from rest_framework import status
from django.test import TransactionTestCase
from django.contrib.auth import get_user_model
from channels.testing import WebsocketCommunicator
from rest_framework_simplejwt.tokens import AccessToken
from TaskManagerBackend.asgi import application
from channels.db import database_sync_to_async
from projects.models import Project
from chats.models import ProjectChat, ChatMessage

User = get_user_model()

# Create your tests here.

class ChatMessageAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="chatapiuser", email="chatapiuser@mail.com", password="pass123")
        self.other_user = User.objects.create_user(username="otheruser", email="otheruser@mail.com", password="pass456")
        self.project = Project.objects.create(title="Chat Project", creator=self.user)
        self.project_chat = ProjectChat.objects.get(project=self.project)

        self.message1 = ChatMessage.objects.create(
            project_chat=self.project_chat,
            sender=self.user,
            content="Hello from the backend!"
        )

        self.client.force_authenticate(user=self.user)

    def test_list_project_chat_messages(self):
        url = f"/api/projects/{self.project.id}/chat-messages/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["content"], "Hello from the backend!")

    def test_create_chat_message(self):
        url = f"/api/projects/{self.project.id}/chat-messages/"
        response = self.client.post(url, {
            "content": "API says hello!",
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ChatMessage.objects.count(), 2)
        self.assertEqual(ChatMessage.objects.last().sender, self.user)

    def test_invalid_project_id_returns_404(self):
        invalid_project_id = 9999
        url = f"/api/projects/{invalid_project_id}/chat-messages/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_authentication_required(self):
        url = f"/api/projects/{self.project.id}/chat-messages/"
        self.client.logout()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class ChatConsumerTests(TransactionTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = User.objects.create_user(username="chatuser", password="testpass")
        cls.project = Project.objects.create(title="Test Chat Project", creator=cls.user)
        cls.project_chat = ProjectChat.objects.get(project=cls.project)

        ChatMessage.objects.create(
            project_chat=cls.project_chat,
            sender=cls.user,
            content="Previous message 1"
        )
        ChatMessage.objects.create(
            project_chat=cls.project_chat,
            sender=cls.user,
            content="Previous message 2"
        )

    async def test_chat_consumer_message_flow(self):
        token = str(AccessToken.for_user(self.user))
        communicator = WebsocketCommunicator(
            application,
            f"/ws/chat/project/{self.project.id}/?token={token}"
        )

        # No need to manually set communicator.scope["user"]
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Receive previous messages
        messages = []
        for _ in range(2):
            response = await communicator.receive_from()
            messages.append(json.loads(response)["message"])

        self.assertIn("Previous message 1", messages)
        self.assertIn("Previous message 2", messages)

        # Send a message
        await communicator.send_to(text_data=json.dumps({
            "content": "New message!",
            "timestamp": "12:00",
            "file": None
        }))

        # Receive the response
        response = await communicator.receive_from()
        data = json.loads(response)

        self.assertEqual(data["message"], "New message!")
        self.assertEqual(data["sender"], self.user.username)

        saved = await database_sync_to_async(ChatMessage.objects.filter(content="New message!").exists)()
        self.assertTrue(saved)

        await communicator.disconnect()