from django.db import models
from django.contrib.auth import get_user_model
from projects.models import Project

User = get_user_model()

# Create your models here.

# Task Board
class TaskBoard(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="task_boards")
    title = models.CharField(max_length=255)
    
    def __str__(self):
        return self.title

class Task(models.Model):
    STATUS_CHOICES = [
        ("TODO", "To Do"),
        ("IN_PROGRESS", "In Progress"),
        ("DONE", "Done")
    ]
    task_board = models.ForeignKey(TaskBoard, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="TODO")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

# Kanban Board
class KanbanBoard(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="kanban_boards")
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title

class KanbanColumn(models.Model):
    kanban_board = models.ForeignKey(KanbanBoard, on_delete=models.CASCADE, related_name="kanban_columns")
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        

    def __str__(self):
        return self.title

class KanbanTask(models.Model):
    kanban_column = models.ForeignKey(KanbanColumn, on_delete=models.CASCADE, related_name="kanban_tasks")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        

    def __str__(self):
        return self.title

# Gantt Chart Board
class GanttBoard(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="gantt_boards")
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title

class GanttTask(models.Model):
    gantt_board = models.ForeignKey(GanttBoard, on_delete=models.CASCADE, related_name="gantt_tasks")
    title = models.CharField(max_length=255)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    deadline_notification_sent = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title