from django.urls import path, include
from rest_framework_nested.routers import DefaultRouter, NestedDefaultRouter
from projects.views import ProjectViewSet
from .views import TaskBoardViewSet, TaskViewSet, KanbanBoardViewSet, KanbanColumnViewSet, KanbanTaskViewSet, GanttBoardViewSet, GanttTaskViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

board_router = NestedDefaultRouter(router, r"projects", lookup="project")
board_router.register(r"task-boards", TaskBoardViewSet, basename="project-taskboards")
board_router.register(r"kanban-boards", KanbanBoardViewSet, basename="project-kanbanboards")
board_router.register(r"gantt-boards", GanttBoardViewSet, basename="project-ganttboards")

task_router = NestedDefaultRouter(board_router, r"task-boards", lookup="task_board")
task_router.register(r"tasks", TaskViewSet, basename="taskboard-tasks")

kanban_column_router = NestedDefaultRouter(board_router, r"kanban-boards", lookup="kanban_board")
kanban_column_router.register(r"columns", KanbanColumnViewSet, basename="kanbanboard-columns")

kanban_task_router = NestedDefaultRouter(kanban_column_router, r"columns", lookup="kanban_column")
kanban_task_router.register(r"tasks", KanbanTaskViewSet, basename="kanbancolumn-tasks")

gantt_task_router = NestedDefaultRouter(board_router, r"gantt-boards", lookup="gantt_board")
gantt_task_router.register(r"tasks", GanttTaskViewSet, basename="ganttboard-tasks")


urlpatterns = [
    path("", include(router.urls)),
    path("", include(board_router.urls)),
    path("", include(task_router.urls)),
    path("", include(kanban_column_router.urls)),
    path("", include(kanban_task_router.urls)),
    path("", include(gantt_task_router.urls)),
]