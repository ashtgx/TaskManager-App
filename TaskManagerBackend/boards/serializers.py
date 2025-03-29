from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TaskBoard, Task, KanbanBoard, KanbanColumn, KanbanTask, GanttBoard, GanttTask
from users.serializers import UserSerializer

User = get_user_model()

class TaskBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskBoard
        exclude = ["project"]

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source='assigned_to', allow_null=True
    )
    class Meta:
        model = Task
        exclude = ["task_board"]

class KanbanBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = KanbanBoard
        exclude = ["project"]

class KanbanTaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="assigned_to", allow_null=True
    )
    kanban_column = serializers.PrimaryKeyRelatedField(
        queryset=KanbanColumn.objects.all(),
        required=False
    )
    class Meta:
        model = KanbanTask
        fields = "__all__"

class KanbanColumnSerializer(serializers.ModelSerializer):
    kanban_tasks = KanbanTaskSerializer(many=True, read_only=True)
    class Meta:
        model = KanbanColumn
        exclude = ["kanban_board"]

class GanttBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = GanttBoard
        exclude = ["project"]

class GanttTaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="assigned_to", allow_null=True
    )
    class Meta:
        model = GanttTask
        exclude = ["gantt_board"]