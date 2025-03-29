from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.
class Project(models.Model):
    title = models.CharField(max_length=255)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="owned_projects")
    collaborators = models.ManyToManyField(User, related_name="projects", blank=True)

    def transfer_ownership(self):
        """Transfers ownership to the first collaborator or deletes the project if none exist."""
        first_collaborator = self.collaborators.first()
        if first_collaborator:
            self.creator = first_collaborator
            self.collaborators.remove(first_collaborator)
            self.save()
        else:
            self.delete()

    def __str__(self):
        return self.title
