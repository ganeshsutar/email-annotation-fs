from django.contrib import admin
from .models import ExportRecord


@admin.register(ExportRecord)
class ExportRecordAdmin(admin.ModelAdmin):
    list_display = ("dataset", "exported_by", "file_size", "exported_at")
    search_fields = ("dataset__name",)
