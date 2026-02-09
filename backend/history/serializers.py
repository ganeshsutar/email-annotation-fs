from rest_framework import serializers

from datasets.serializers import MiniUserSerializer


class VersionHistoryAnnotationVersionSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    version_number = serializers.IntegerField()
    created_by = MiniUserSerializer()
    source = serializers.CharField()
    annotation_count = serializers.IntegerField()
    created_at = serializers.DateTimeField()


class VersionHistoryQAReviewSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    version_number = serializers.IntegerField()
    annotation_version = serializers.UUIDField()
    reviewed_by = MiniUserSerializer()
    decision = serializers.CharField()
    comments = serializers.CharField()
    modifications_summary = serializers.CharField()
    reviewed_at = serializers.DateTimeField()


class VersionHistoryJobInfoSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    file_name = serializers.CharField()
    dataset_name = serializers.CharField()
    status = serializers.CharField()
    created_at = serializers.DateTimeField()
