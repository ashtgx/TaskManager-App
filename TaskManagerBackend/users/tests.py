from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your tests here.

class UserAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123", email="test@example.com"
        )
        self.register_url = reverse("register")
        self.login_url = reverse("token_obtain_pair")
        self.refresh_url = reverse("token_refresh")
        self.profile_url = reverse("user-profile")

    def test_user_registration(self):
        data = {
            "username": "newuser",
            "password": "newpass123",
            "email": "new@example.com"
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_user_login(self):
        response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "testpass123"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_token_refresh(self):
        login_response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "testpass123"
        })
        refresh_token = login_response.data["refresh"]
        response = self.client.post(self.refresh_url, {"refresh": refresh_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_retrieve_user_profile(self):
        token = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "testpass123"
        }).data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(response.data["email"], "test@example.com")

    def test_update_user_email(self):
        token = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "testpass123"
        }).data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.patch(self.profile_url, {"email": "updated@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "updated@example.com")