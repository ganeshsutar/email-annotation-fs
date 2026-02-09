import re

from rest_framework import serializers

from .models import AnnotationClass


class MiniUserSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()


class AnnotationClassSerializer(serializers.ModelSerializer):
    created_by = MiniUserSerializer(read_only=True)

    class Meta:
        model = AnnotationClass
        fields = [
            "id",
            "name",
            "display_label",
            "color",
            "description",
            "created_by",
            "created_at",
        ]
        read_only_fields = fields


class CreateAnnotationClassSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    display_label = serializers.CharField(max_length=100)
    color = serializers.CharField(max_length=7)
    description = serializers.CharField(required=False, default="", allow_blank=True)

    def validate_name(self, value):
        if not re.match(r"^[a-z][a-z0-9_]*$", value):
            raise serializers.ValidationError(
                "Name must start with a lowercase letter and contain only "
                "lowercase letters, digits, and underscores."
            )
        if AnnotationClass.objects.filter(name=value, is_deleted=False).exists():
            raise serializers.ValidationError(
                "An annotation class with this name already exists."
            )
        return value

    def validate_color(self, value):
        if not re.match(r"^#[0-9a-fA-F]{6}$", value):
            raise serializers.ValidationError("Color must be in #RRGGBB format.")
        return value


class UpdateAnnotationClassSerializer(serializers.Serializer):
    display_label = serializers.CharField(max_length=100, required=False)
    color = serializers.CharField(max_length=7, required=False)
    description = serializers.CharField(required=False, allow_blank=True)

    def validate_color(self, value):
        if not re.match(r"^#[0-9a-fA-F]{6}$", value):
            raise serializers.ValidationError("Color must be in #RRGGBB format.")
        return value
