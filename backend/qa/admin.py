from django.contrib import admin
from .models import QAReviewVersion


@admin.register(QAReviewVersion)
class QAReviewVersionAdmin(admin.ModelAdmin):
    list_display = ("job", "version_number", "reviewed_by", "decision", "reviewed_at")
    list_filter = ("decision",)
