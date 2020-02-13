from django.contrib.auth.models import User, Permission

from rest_framework import serializers

from core.models import Client, Project, Entry
from core.fields import DurationField

from core.models import Task


class PermissionSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Permission
        fields = ("id", "url", "name", "codename")


class UserSerializer(serializers.HyperlinkedModelSerializer):
    perms = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "url",
            "username",
            "is_active",
            "is_staff",
            "is_superuser",
            "perms",
            # "groups",
        )

    def get_perms(self, obj):
        perms = {}
        if obj.is_superuser:
            queryset = Permission.objects.all()
        else:
            queryset = Permission.objects.filter(user=obj)
        for perm in queryset.values():
            perms[perm["codename"]] = perm
        return perms


class ClientSerializer(serializers.HyperlinkedModelSerializer):
    total_projects = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = (
            "id",
            "url",
            "name",
            "payment_id",
            "archive",
            "total_projects",
            "total_duration",
        )

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(archive=False)

    def get_total_projects(self, obj):
        return obj.get_total_projects()

    def get_total_duration(self, obj):
        return obj.get_total_duration()


class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    total_entries = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()
    percent_done = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            "id",
            "url",
            "client",
            "name",
            "archive",
            "estimate",
            "total_entries",
            "total_duration",
            "percent_done",
            "intra_id"
        )

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(archive=False)

    def get_total_entries(self, obj):
        return obj.get_total_entries()

    def get_total_duration(self, obj):
        return obj.get_total_duration()

    def get_percent_done(self, obj):
        return obj.get_percent_done()


class TaskSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Task
        fields = ("id", "url", "name", "hourly_rate", "intra_id")


class EntrySerializer(serializers.HyperlinkedModelSerializer):
    duration = DurationField()

    class Meta:
        model = Entry
        fields = (
            "id",
            "url",
            "project",
            "task",
            "user",
            "date",
            "duration",
            "datetime_start",
            "datetime_end",
            "note"
        )
