import smtplib
from email.mime.text import MIMEText
from app.core.config import settings


def send_contact_email(
    name: str,
    email: str,
    message: str,
    phone: str | None = None,
):
    try:
        body = f"""
New Contact Submission 🚀

Name: {name}
Email: {email}
Phone: {phone or "N/A"}

Message:
{message}
"""

        msg = MIMEText(body)
        msg["Subject"] = "New Contact Form Submission"
        msg["From"] = settings.SMTP_EMAIL
        msg["To"] = settings.SMTP_EMAIL

        # 🔥 USE STARTTLS (IMPORTANT FIX)
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.sendmail(
                settings.SMTP_EMAIL,
                settings.SMTP_EMAIL,
                msg.as_string()
            )

        print("✅ Email sent successfully")

    except Exception as e:
        print("❌ Email error:", e)