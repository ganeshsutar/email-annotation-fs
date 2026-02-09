import logging

from rest_framework.views import exception_handler

logger = logging.getLogger("api")


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        logger.exception("Unhandled exception in %s", context.get("view", ""))
        return None

    if response.status_code >= 500:
        logger.error(
            "Server error %s in %s: %s",
            response.status_code,
            context.get("view", ""),
            response.data,
        )

    return response
