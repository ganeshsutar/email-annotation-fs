from django.contrib import admin
from .models import Dataset, Job


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ("name", "uploaded_by", "upload_date", "file_count", "status")
    list_filter = ("status",)
    search_fields = ("name",)


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("file_name", "dataset", "status", "assigned_annotator", "assigned_qa", "updated_at")
    list_filter = ("status",)
    search_fields = ("file_name", "dataset__name")
