import uuid
from django.conf import settings
from django.db import models


class QAReviewVersion(models.Model):
    class Decision(models.TextChoices):
        ACCEPT = "ACCEPT", "Accept"
        REJECT = "REJECT", "Reject"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey("datasets.Job", on_delete=models.CASCADE, related_name="qa_reviews")
    version_number = models.PositiveIntegerField()
    annotation_version = models.ForeignKey(
        "annotations.AnnotationVersion", on_delete=models.CASCADE, related_name="qa_reviews"
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="qa_reviews"
    )
    decision = models.CharField(max_length=10, choices=Decision.choices)
    comments = models.TextField(blank=True, default="")
    modifications_summary = models.TextField(blank=True, default="")
    reviewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["job", "version_number"]]

    def __str__(self):
        return f"QA Review Job {self.job_id} v{self.version_number} - {self.decision}"


class QADraftReview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.OneToOneField(
        "datasets.Job", on_delete=models.CASCADE, related_name="qa_draft_review"
    )
    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"QA Draft for Job {self.job_id}"
