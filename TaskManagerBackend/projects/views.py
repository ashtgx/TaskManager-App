from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Project
from .serializers import ProjectSerializer

User = get_user_model()

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(Q(creator=user) | Q(collaborators=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'], url_path='invite')
    def invite_collaborator(self, request, pk=None):
        project = self.get_object()
        user = request.user
        username = request.data.get("username")
        if request.user != project.creator:
            return Response({"detail": "Only project creator can invite collaborators"}, status=403)
        
        if not username:
            return Response({"detail": "Username is required."}, status=400)
        try:
            user_to_invite = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)
        
        if user_to_invite == project.creator or user_to_invite in project.collaborators.all():
            return Response({"detail": "User is already in the project."}, status=400)

        project.collaborators.add(user_to_invite)
        return Response({"detail": f"{user_to_invite.username} has been invited."})
    
    @action(detail=True, methods=['post'], url_path='transfer-ownership')
    def transfer_ownership(self, request, pk=None):
        project = self.get_object()
        if request.user != project.creator:
            return Response(
                {"detail": "Only the project creator can transfer ownership."},
                status=status.HTTP_403_FORBIDDEN
            )

        new_owner_id = request.data.get("new_owner_id")
        if not new_owner_id:
            return Response({"detail": "New owner ID is required."}, status=400)

        try:
            new_owner = User.objects.get(id=new_owner_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        if new_owner not in project.collaborators.all():
            return Response({"detail": "User must be a collaborator to become owner."}, status=400)

        # Transfer ownership
        project.collaborators.remove(new_owner)
        project.collaborators.add(project.creator)
        project.creator = new_owner
        project.save()

        return Response(
            {"detail": f"Ownership transferred to {new_owner.username}."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """
        Allows a user to leave the project.
        - If the user is the creator and there are collaborators, transfer ownership.
        - If the user is the creator with no collaborators, delete the project.
        - Otherwise, remove the user from the collaborators list.
        """
        project = self.get_object()
        user = request.user

        if user == project.creator:
            if project.collaborators.exists():
                project.transfer_ownership()
                return Response(
                    {'detail': 'You left the project. Ownership transferred to a collaborator.'},
                    status=status.HTTP_200_OK
                )
            else:
                project.delete()
                return Response(
                    {'detail': 'You left the project. The project was deleted as no collaborators remained.'},
                    status=status.HTTP_200_OK
                )
        else:
            if user in project.collaborators.all():
                project.collaborators.remove(user)
                return Response(
                    {'detail': 'You have left the project.'},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'detail': 'You are not a collaborator of this project.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

    @action(detail=True, methods=['post'], url_path='remove-collaborator')
    def remove_collaborator(self, request, pk=None):
        project = self.get_object()
        if request.user != project.creator and not request.user.is_superuser:
            return Response(
                {'detail': 'Only the project owner or an admin can remove collaborators.'},
                status=status.HTTP_403_FORBIDDEN
            )

        collaborator_id = request.data.get("collaborator_id")
        if not collaborator_id:
            return Response({'detail': 'collaborator_id is required.'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            collaborator = User.objects.get(id=collaborator_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'},
                            status=status.HTTP_404_NOT_FOUND)

        if collaborator not in project.collaborators.all():
            return Response({'detail': 'This user is not a collaborator.'},
                            status=status.HTTP_400_BAD_REQUEST)

        project.collaborators.remove(collaborator)
        return Response(
            {'detail': f'User {collaborator.username} has been removed from the project.'},
            status=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        project = self.get_object()
        if request.user != project.creator and not request.user.is_superuser:
            return Response(
                {'detail': 'Only the project owner or an admin can delete this project.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)