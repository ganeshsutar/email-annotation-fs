from django.urls import path

from .settings_views import blind_review_setting

urlpatterns = [
    path("blind-review/", blind_review_setting),
]
