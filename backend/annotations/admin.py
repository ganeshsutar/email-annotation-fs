from django.contrib import admin
from .models import AnnotationVersion, Annotation, DraftAnnotation


@admin.register(AnnotationVersion)
class AnnotationVersionAdmin(admin.ModelAdmin):
    list_display = ("job", "version_number", "created_by", "source", "created_at")
    list_filter = ("source",)


@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = ("class_name", "annotation_version", "start_offset", "end_offset", "created_at")
    search_fields = ("class_name", "original_text")


@admin.register(DraftAnnotation)
class DraftAnnotationAdmin(admin.ModelAdmin):
    list_display = ("job", "updated_at")
