from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from projects.models import Project
from .models import TaskBoard, Task, KanbanBoard, KanbanColumn, KanbanTask, GanttBoard, GanttTask
from .serializers import TaskBoardSerializer, TaskSerializer, KanbanBoardSerializer, KanbanColumnSerializer, KanbanTaskSerializer, GanttBoardSerializer, GanttTaskSerializer

# Create your views here.
class TaskBoardViewSet(viewsets.ModelViewSet):
    serializer_class = TaskBoardSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TaskBoard.objects.filter(project_id=self.kwargs["project_pk"])

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs["project_pk"])
        serializer.save(project=project)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(task_board_id=self.kwargs["task_board_pk"]).order_by("order")

    def perform_create(self, serializer):
        project_id = self.kwargs["project_pk"]
        task_board_id = self.kwargs["task_board_pk"]
        task_board = get_object_or_404(TaskBoard, pk=task_board_id, project_id=project_id)
        max_order = Task.objects.filter(task_board=task_board).aggregate(models.Max('order'))['order__max'] or 0
        serializer.save(task_board=task_board, order=max_order + 1)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        request_data = request.data.copy()

        if "task_board_pk" in self.kwargs:
            request_data["task_board"] = self.kwargs["task_board_pk"]

        serializer = self.get_serializer(instance, data=request_data)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        return Response(serializer.data)
    
    @action(detail=False, methods=["post"], url_path="reorder")
    def reorder_tasks(self, request, project_pk=None, task_board_pk=None):
        new_order = request.data.get("order")
        if not isinstance(new_order, list):
            return Response({"detail": "Invalid format."}, status=status.HTTP_400_BAD_REQUEST)

        for index, task_id in enumerate(new_order):
            try:
                task = Task.objects.get(pk=task_id, task_board_id=task_board_pk)
                task.order = index
                task.save()
            except Task.DoesNotExist:
                continue

        return Response({"detail": "Order updated successfully."})


class KanbanBoardViewSet(viewsets.ModelViewSet):
    serializer_class = KanbanBoardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return KanbanBoard.objects.filter(project_id=self.kwargs["project_pk"])

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs["project_pk"])
        serializer.save(project=project)


class KanbanColumnViewSet(viewsets.ModelViewSet):
    serializer_class = KanbanColumnSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return KanbanColumn.objects.filter(kanban_board_id=self.kwargs["kanban_board_pk"]).order_by("order")

    def perform_create(self, serializer):
        kanban_board = get_object_or_404(KanbanBoard, pk=self.kwargs["kanban_board_pk"])
        max_order = KanbanColumn.objects.filter(kanban_board=kanban_board).aggregate(models.Max('order'))['order__max'] or 0
        serializer.save(kanban_board=kanban_board, order=max_order + 1)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        request_data = request.data.copy()

        if "kanban_board_pk" in self.kwargs:
            request_data["kanban_board"] = self.kwargs["kanban_board_pk"]

        serializer = self.get_serializer(instance, data=request_data, partial=True)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="reorder")
    def reorder_columns(self, request, kanban_board_pk=None):
        order = request.data.get("order", [])
        for idx, column_id in enumerate(order):
            KanbanColumn.objects.filter(id=column_id, kanban_board_id=kanban_board_pk).update(order=idx)
        return Response({"status": "Columns reordered"})


class KanbanTaskViewSet(viewsets.ModelViewSet):
    serializer_class = KanbanTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return KanbanTask.objects.all()
    
    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs["pk"])
        return obj

    def perform_create(self, serializer):
        kanban_column = get_object_or_404(KanbanColumn, pk=self.kwargs["kanban_column_pk"])
        max_order = KanbanTask.objects.filter(kanban_column=kanban_column).aggregate(models.Max('order'))['order__max'] or 0
        serializer.save(kanban_column=kanban_column, order=max_order + 1)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        request_data = request.data.copy()

        if "kanban_column_pk" in self.kwargs:
            request_data["kanban_column"] = self.kwargs["kanban_column_pk"]

        serializer = self.get_serializer(instance, data=request_data, partial=True)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="reorder")
    def reorder_tasks(self, request, kanban_column_pk=None):
        order = request.data.get("order", [])
        for idx, task_id in enumerate(order):
            KanbanTask.objects.filter(id=task_id, kanban_column_id=kanban_column_pk).update(order=idx)
        return Response({"status": "Tasks reordered"})


class GanttBoardViewSet(viewsets.ModelViewSet):
    serializer_class = GanttBoardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GanttBoard.objects.filter(project_id=self.kwargs["project_pk"])

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs["project_pk"])
        serializer.save(project=project)


class GanttTaskViewSet(viewsets.ModelViewSet):
    serializer_class = GanttTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GanttTask.objects.filter(gantt_board_id=self.kwargs["gantt_board_pk"]).order_by("order")

    def perform_create(self, serializer):
        gantt_board = get_object_or_404(GanttBoard, pk=self.kwargs["gantt_board_pk"])
        max_order = GanttTask.objects.filter(gantt_board=gantt_board).aggregate(models.Max('order'))['order__max'] or 0
        serializer.save(gantt_board=gantt_board, order=max_order + 1)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        request_data = request.data.copy()

        if "gantt_board_pk" in self.kwargs:
            request_data["gantt_board"] = self.kwargs["gantt_board_pk"]

        serializer = self.get_serializer(instance, data=request_data, partial=True)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_update(serializer)
        return Response(serializer.data)