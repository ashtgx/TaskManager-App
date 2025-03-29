from django.contrib import admin
from .models import TaskBoard, Task, KanbanBoard, KanbanColumn, KanbanTask, GanttBoard, GanttTask

# Register your models here.
admin.site.register(TaskBoard)
admin.site.register(Task)
admin.site.register(KanbanBoard)
admin.site.register(KanbanColumn)
admin.site.register(KanbanTask)
admin.site.register(GanttBoard)
admin.site.register(GanttTask)