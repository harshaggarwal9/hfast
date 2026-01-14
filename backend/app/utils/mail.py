import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi.templating import Jinja2Templates
from datetime import datetime

templates = Jinja2Templates(directory="app/utils")

SMTP_HOST = os.getenv("SMTP_SERVICE")
SMTP_PORT = 465
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_USER_PASS")

def send_template_mail(
    *,
    to: str,
    subject: str,
    template_data: dict,
    template_name: str = "mail.html",
):


    html = templates.get_template(template_name).render(template_data)

    message = MIMEMultipart("alternative")
    message["From"] = SMTP_USER
    message["To"] = to
    message["Subject"] = subject

    message.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(
            SMTP_USER,
            to,
            message.as_string(),
        )
