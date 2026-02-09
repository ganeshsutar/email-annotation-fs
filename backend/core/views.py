from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from annotations.models import Annotation
from core.permissions import IsAdmin, IsAnyRole

from .models import AnnotationClass
from .serializers import (
    AnnotationClassSerializer,
    CreateAnnotationClassSerializer,
    UpdateAnnotationClassSerializer,
)


class AnnotationClassViewSet(ViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_permissions(self):
        if self.action in ("list", "usage"):
            return [IsAuthenticated(), IsAnyRole()]
        return super().get_permissions()

    def list(self, request):
        queryset = AnnotationClass.objects.filter(is_deleted=False).order_by(
            "display_label"
        )
        return Response(AnnotationClassSerializer(queryset, many=True).data)

    def create(self, request):
        serializer = CreateAnnotationClassSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        annotation_class = AnnotationClass.objects.create(
            name=data["name"],
            display_label=data["display_label"],
            color=data["color"],
            description=data.get("description", ""),
            created_by=request.user,
        )
        return Response(
            AnnotationClassSerializer(annotation_class).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, pk=None):
        try:
            annotation_class = AnnotationClass.objects.get(pk=pk, is_deleted=False)
        except AnnotationClass.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateAnnotationClassSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        for attr, value in serializer.validated_data.items():
            setattr(annotation_class, attr, value)
        annotation_class.save(update_fields=list(serializer.validated_data.keys()))

        return Response(AnnotationClassSerializer(annotation_class).data)

    def destroy(self, request, pk=None):
        try:
            annotation_class = AnnotationClass.objects.get(pk=pk, is_deleted=False)
        except AnnotationClass.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        annotation_class.is_deleted = True
        annotation_class.save(update_fields=["is_deleted"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"])
    def usage(self, request, pk=None):
        try:
            annotation_class = AnnotationClass.objects.get(pk=pk, is_deleted=False)
        except AnnotationClass.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        count = Annotation.objects.filter(annotation_class=annotation_class).count()
        return Response(
            {
                "annotation_class_id": str(annotation_class.id),
                "annotation_count": count,
            }
        )
