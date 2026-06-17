def ok(data=None, status=200, **extra):
    payload = {"success": True}
    if data:
        payload.update(data)
    payload.update(extra)
    return payload, status


def fail(message="Erro interno do servidor", status=500, details=None):
    payload = {"success": False, "message": message}
    if details is not None:
        payload["details"] = details
    return payload, status


def pagination(query, default_limit=20):
    try:
        page = max(int(query.get("page", 1)), 1)
    except (TypeError, ValueError):
        page = 1
    limit_value = query.get("limit", query.get("limite", default_limit))
    try:
        limit = min(max(int(limit_value), 1), 100)
    except (TypeError, ValueError):
        limit = default_limit
    return page, limit, (page - 1) * limit


def pagination_payload(total, page, limit):
    pages = max((total + limit - 1) // limit, 1)
    return {"total": total, "page": page, "limit": limit, "totalPages": pages}
