from django.conf import settings
from django.http import HttpResponse
from django.views import View


class SPAView(View):
    _index_html = None

    def get(self, request, *args, **kwargs):
        if SPAView._index_html is None:
            index_path = settings.FRONTEND_DIR / "index.html"
            with open(index_path, "r") as f:
                SPAView._index_html = f.read()
        return HttpResponse(SPAView._index_html, content_type="text/html")
