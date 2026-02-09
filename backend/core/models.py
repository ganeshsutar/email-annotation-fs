import uuid
from django.conf import settings
from django.db import models


class AnnotationClass(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    display_label = models.CharField(max_length=100)
    color = models.CharField(max_length=7)
    description = models.TextField(blank=True, default="")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_annotation_classes"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "annotation classes"

    def __str__(self):
        return self.display_label


class PlatformSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField(blank=True, default="")

    def __str__(self):
        return f"{self.key}: {self.value}"
