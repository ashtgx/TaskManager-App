from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project

User = get_user_model()

class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class ProjectSerializer(serializers.ModelSerializer):
    creator = UserSummarySerializer(read_only=True)
    collaborators = UserSummarySerializer(read_only=True, many=True)
    collaborator_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        many=True,
        required=False
    )

    class Meta:
        model = Project
        fields = ['id', 'title', 'creator', 'collaborators', 'collaborator_ids']
        read_only_fields = ['id', 'creator', 'collaborators']

    def create(self, validated_data):
        collaborator_ids = validated_data.pop('collaborator_ids', [])
        project = Project.objects.create(**validated_data)
        project.collaborators.set(collaborator_ids)
        return project

    def update(self, instance, validated_data):
        collaborator_ids = validated_data.pop('collaborator_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if collaborator_ids is not None:
            instance.collaborators.set(collaborator_ids)
        return instance