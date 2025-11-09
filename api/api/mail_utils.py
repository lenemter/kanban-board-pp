import os

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from fastapi_mail.errors import ConnectionErrors
from pydantic import NameEmail, SecretStr
from tenacity import retry, stop_after_attempt, wait_fixed

from api.db.models.user import User

conf: ConnectionConfig | None = None

mail_username = os.getenv("MAIL_USERNAME")
_mail_password = os.getenv("MAIL_PASSWORD")
mail_server = os.getenv("MAIL_SERVER")
_mail_port = os.getenv("MAIL_PORT")
if (
    mail_username is None or
    _mail_password is None or
    mail_server is None or
    _mail_port is None
):
    pass
else:
    mail_password = SecretStr(_mail_password)
    mail_port = int(_mail_port)

    del _mail_password
    del _mail_port

    conf = ConnectionConfig(
        MAIL_USERNAME=mail_username,
        MAIL_PASSWORD=mail_password,
        MAIL_FROM="noreply@owouwukanban.ru",
        MAIL_SERVER=mail_server,
        MAIL_PORT=mail_port,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
    )


@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
async def send_mail(to: NameEmail, subject: str, body: str) -> None:
    if conf == None:
        return

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


async def send_registered_email(user: User) -> None:
    await send_mail(NameEmail(user.name, user.email), "Confirm your account", "Not implemented yet")
