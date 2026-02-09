from django.urls import path

from .views import HistoryViewSet

urlpatterns = [
    path(
        "jobs/<uuid:job_id>/",
        HistoryViewSet.as_view({"get": "get_version_history"}),
    ),
    path(
        "jobs/<uuid:job_id>/info/",
        HistoryViewSet.as_view({"get": "get_job_info"}),
    ),
    path(
        "versions/<uuid:version_id>/annotations/",
        HistoryViewSet.as_view({"get": "get_annotations_for_version"}),
    ),
]
