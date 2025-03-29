from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from django.urls import reverse
from datetime import date, timedelta
from projects.models import Project
from .models import *

User = get_user_model()

# Create your tests here.

class TaskAppAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="apiuser", password="testpass")
        self.project = Project.objects.create(title="API Project", creator=self.user)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    # Task Board Tests

    def test_create_task_board(self):
        url = reverse("project-taskboards-list", kwargs={"project_pk": self.project.pk})
        response = self.client.post(url, {"title": "Board 1", "project": self.project.id})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TaskBoard.objects.count(), 1)

    def test_create_task(self):
        board = TaskBoard.objects.create(title="Board", project=self.project)
        url = reverse("taskboard-tasks-list", kwargs={"project_pk": self.project.pk, "task_board_pk": board.pk})
        response = self.client.post(url, {
            "title": "Do Something",
            "description": "API test task",
            "status": "TODO",
            "task_board": board.id,
            "assigned_to": self.user.id,
            "assigned_to_id": self.user.id
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Task.objects.count(), 1)

    # Kanban Board Tests

    def test_create_kanban_board_and_column_and_task(self):
        board_url = reverse("project-kanbanboards-list", kwargs={"project_pk": self.project.pk})
        board_resp = self.client.post(board_url, {"title": "Kanban Board", "project": self.project.pk})
        self.assertEqual(board_resp.status_code, 201)
        board_id = board_resp.data["id"]

        column_url = reverse("kanbanboard-columns-list", kwargs={"project_pk": self.project.pk, "kanban_board_pk": board_id})
        column_resp = self.client.post(column_url, {"title": "To Do", "kanban_board": board_id})
        self.assertEqual(column_resp.status_code, 201)
        column_id = column_resp.data["id"]

        task_url = reverse("kanbancolumn-tasks-list", kwargs={"project_pk": self.project.pk, "kanban_board_pk": board_id, "kanban_column_pk": column_id})
        task_resp = self.client.post(task_url, {
            "title": "Drag me",
            "description": "Kanban task description",
            "kanban_column": column_id,
            "assigned_to": self.user.id,
            "assigned_to_id": self.user.id
        })
        self.assertEqual(task_resp.status_code, 201)
        self.assertEqual(KanbanTask.objects.count(), 1)

    # Gantt Board Tests

    def test_create_gantt_board_and_task(self):
        gantt_board_url = reverse("project-ganttboards-list", kwargs={"project_pk": self.project.pk})
        board_resp = self.client.post(gantt_board_url, {"title": "Gantt Board", "project": self.project.id})
        self.assertEqual(board_resp.status_code, 201)
        board_id = board_resp.data["id"]

        task_url = reverse("ganttboard-tasks-list", kwargs={"project_pk": self.project.pk, "gantt_board_pk": board_id})
        response = self.client.post(task_url, {
            "title": "Milestone A",
            "gantt_board": board_id,
            "assigned_to": self.user.id,
            "assigned_to_id": self.user.id,
            "start_date": "2025-03-25",
            "end_date": "2025-03-30"
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(GanttTask.objects.count(), 1)
