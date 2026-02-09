import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { TableSkeleton } from "@/components/table-skeleton";
import { Button } from "@/components/ui/button";
import { useAnnotationClasses } from "@/features/annotation-classes/api/get-annotation-classes";
import { AnnotationClassesTable } from "@/features/annotation-classes/components/annotation-classes-table";
import { AnnotationClassFormDialog } from "@/features/annotation-classes/components/annotation-class-form-dialog";
import { DeleteConfirmDialog } from "@/features/annotation-classes/components/delete-confirm-dialog";
import type { AnnotationClass } from "@/types/models";

export const Route = createFileRoute("/admin/annotation-classes")({
  component: AnnotationClassesPage,
});

function AnnotationClassesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<AnnotationClass | null>(
    null,
  );
  const [deletingClass, setDeletingClass] = useState<AnnotationClass | null>(
    null,
  );

  const { data: classes, isLoading } = useAnnotationClasses();

  function handleCreate() {
    setEditingClass(null);
    setFormOpen(true);
  }

  function handleEdit(cls: AnnotationClass) {
    setEditingClass(cls);
    setFormOpen(true);
  }

  function handleDelete(cls: AnnotationClass) {
    setDeletingClass(cls);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Annotation Classes</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Class
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} columns={5} />
      ) : (
        <AnnotationClassesTable
          classes={classes ?? []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <AnnotationClassFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        annotationClass={editingClass}
      />

      <DeleteConfirmDialog
        open={!!deletingClass}
        onOpenChange={(open) => !open && setDeletingClass(null)}
        annotationClass={deletingClass}
      />
    </div>
  );
}
