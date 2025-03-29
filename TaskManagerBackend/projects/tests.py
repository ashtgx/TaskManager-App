from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from .models import Project


# Create your tests here.
User = get_user_model()

class ProjectTests(APITestCase):
    def setUp(self):
        # Create two users: one as creator and one as collaborator.
        self.creator = User.objects.create_user(username='creator', email='creator@example.com', password='testpass')
        self.collaborator = User.objects.create_user(username='collab', email='collab@example.com', password='testpass')
        self.client = APIClient()
        # Authenticate as the creator.
        self.client.force_authenticate(user=self.creator)
        self.project = Project.objects.create(title='Test Project', creator=self.creator)
        self.project.collaborators.add(self.collaborator)

    def test_only_creator_can_transfer_ownership(self):
        self.client.logout()
        self.client.force_authenticate(user=self.collaborator)
        url = reverse('project-transfer-ownership', kwargs={'pk': self.project.id})
        data = {"new_owner_id": self.collaborator.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_transfer_ownership_by_creator(self):
        url = reverse('project-transfer-ownership', kwargs={'pk': self.project.id})
        data = {'new_owner_id': self.collaborator.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.creator, self.collaborator)

    def test_transfer_ownership_to_non_collaborator_fails(self):
        outsider = User.objects.create_user(username='outsider', email='outsider@example.com', password='testpass')
        url = reverse('project-transfer-ownership', kwargs={'pk': self.project.id})
        data = {'new_owner_id': outsider.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_leave_project_as_creator_with_collaborators(self):
        url = reverse('project-leave', kwargs={'pk': self.project.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.project.refresh_from_db()
        self.assertEqual(self.project.creator, self.collaborator)
    
    def test_leave_project_as_creator_no_collaborators(self):
        project = Project.objects.create(title='Solo Project', creator=self.creator)
        url = reverse('project-leave', kwargs={'pk': project.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        with self.assertRaises(Project.DoesNotExist):
            Project.objects.get(id=project.id)
    
    def test_leave_project_as_collaborator(self):
        self.client.force_authenticate(user=self.collaborator)
        url = reverse('project-leave', kwargs={'pk': self.project.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.project.refresh_from_db()
        self.assertNotIn(self.collaborator, self.project.collaborators.all())
    
    def test_remove_collaborator(self):
        url = reverse('project-remove-collaborator', kwargs={'pk': self.project.id})
        data = {'collaborator_id': self.collaborator.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200)
        self.project.refresh_from_db()
        self.assertNotIn(self.collaborator, self.project.collaborators.all())
    
    def test_delete_project_by_non_owner(self):
        self.client.force_authenticate(user=self.collaborator)
        url = reverse('project-detail', kwargs={'pk': self.project.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)
    
    def test_delete_project_by_owner(self):
        self.client.force_authenticate(user=self.creator)
        url = reverse('project-detail', kwargs={'pk': self.project.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
