from django.contrib import admin
from .models import AnnotationClass, PlatformSetting


@admin.register(AnnotationClass)
class AnnotationClassAdmin(admin.ModelAdmin):
    list_display = ("name", "display_label", "color", "created_by", "created_at")
    search_fields = ("name", "display_label")


@admin.register(PlatformSetting)
class PlatformSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "value")
    search_fields = ("key",)
