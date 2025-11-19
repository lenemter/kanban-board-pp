import os

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from fastapi_mail.errors import ConnectionErrors
from pydantic import NameEmail, SecretStr
from tenacity import retry, stop_after_attempt, wait_fixed

from api.db.models.user import User
import api.utils

mail_username = os.getenv("MAIL_USERNAME")
_mail_password = os.getenv("MAIL_PASSWORD")
mail_server = os.getenv("MAIL_SERVER")
_mail_port = os.getenv("MAIL_PORT")

mail_support = (
    mail_username is not None and
    _mail_password is not None and
    mail_server is not None and
    _mail_port is not None
)

print(f"MAIL SUPPORT {mail_support}")

if mail_support:
    mail_password = SecretStr(_mail_password)  # type: ignore
    mail_port = int(_mail_port)  # type: ignore

    del _mail_password
    del _mail_port

    conf = ConnectionConfig(
        MAIL_USERNAME=mail_username,  # type: ignore
        MAIL_PASSWORD=mail_password,
        MAIL_FROM="noreply@owouwukanban.ru",
        MAIL_SERVER=mail_server,  # type: ignore
        MAIL_PORT=mail_port,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
    )


@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
async def send_mail(to: NameEmail, subject: str, body: str) -> None:
    message = MessageSchema(
        recipients=[to],
        subject=subject,
        body=body,
        subtype=MessageType.plain
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
    except ConnectionErrors as e:
        print(f"Email connection failed: {e}, retrying...")
        raise


async def send_verification_email(base_url: str, user: User) -> None:
    verification_link = f"{base_url}{api.utils.PREFIX}/verify/{user.verification_token}"

    await send_mail(
        NameEmail(user.name, user.email),
        "Confirm your account",
        f"Click this link to verify your email: {verification_link}"
    )
