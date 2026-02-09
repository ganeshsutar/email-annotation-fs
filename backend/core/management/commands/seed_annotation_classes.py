from django.core.management.base import BaseCommand

from core.models import AnnotationClass

DEFAULT_CLASSES = [
    {"name": "email", "display_label": "Email", "color": "#E53E3E"},
    {"name": "first_name_person", "display_label": "First Name (Person)", "color": "#DD6B20"},
    {"name": "last_name_person", "display_label": "Last Name (Person)", "color": "#D69E2E"},
    {"name": "phone", "display_label": "Phone", "color": "#38A169"},
    {"name": "address", "display_label": "Address", "color": "#3182CE"},
    {"name": "city", "display_label": "City", "color": "#805AD5"},
    {"name": "state", "display_label": "State", "color": "#D53F8C"},
    {"name": "zip_code", "display_label": "Zip Code", "color": "#718096"},
    {"name": "card_number", "display_label": "Card Number", "color": "#E53E3E"},
    {"name": "account_number", "display_label": "Account Number", "color": "#2B6CB0"},
    {"name": "full_name_person", "display_label": "Full Name (Person)", "color": "#B7791F"},
]


class Command(BaseCommand):
    help = "Seed default annotation classes"

    def handle(self, *args, **options):
        created_count = 0
        for cls_data in DEFAULT_CLASSES:
            _, created = AnnotationClass.objects.get_or_create(
                name=cls_data["name"],
                defaults={
                    "display_label": cls_data["display_label"],
                    "color": cls_data["color"],
                },
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {created_count} annotation classes "
                f"({len(DEFAULT_CLASSES) - created_count} already existed)."
            )
        )
