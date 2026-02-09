from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "ADMIN"


class IsAnnotator(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "ANNOTATOR"


class IsQA(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "QA"


class IsAdminOrAnnotator(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("ADMIN", "ANNOTATOR")


class IsAdminOrQA(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("ADMIN", "QA")


class IsAnyRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("ADMIN", "ANNOTATOR", "QA")
