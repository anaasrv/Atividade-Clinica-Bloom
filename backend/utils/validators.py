import re
from datetime import date, datetime

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def is_valid_email(email: str | None) -> bool:
    return bool(email and EMAIL_RE.match(email))


def only_digits(value: str | None) -> str:
    return re.sub(r"\D", "", value or "")


def is_valid_phone(phone: str | None) -> bool:
    digits = only_digits(phone)
    return 10 <= len(digits) <= 11


def parse_date(value: str | date | None) -> date | None:
    if value in (None, ""):
        return None
    if isinstance(value, date):
        return value
    return datetime.strptime(str(value)[:10], "%Y-%m-%d").date()


def parse_time(value):
    if value in (None, ""):
        return None
    if hasattr(value, "hour"):
        return value
    text = str(value).strip()
    for fmt in ("%H:%M:%S", "%H:%M"):
        try:
            return datetime.strptime(text, fmt).time()
        except ValueError:
            continue
    raise ValueError("Horário inválido. Use HH:MM ou HH:MM:SS")
