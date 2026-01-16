import hmac
import hashlib
import json
import os
from datetime import datetime
from fastapi import Depends
from fastapi import APIRouter, Request, Response, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_async_db
from app.model.model import Fee, PaymentInfo, FeeStatusEnum, PaymentStatusEnum

router = APIRouter(prefix="/webhook", tags=["Webhook"])

@router.post("/razorpay")
async def handle_razorpay_webhook(request: Request,db: AsyncSession = Depends(get_async_db)):

    secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")

    raw_body = await request.body()
    signature = request.headers.get("x-razorpay-signature")

    expected_signature = hmac.new(secret.encode(),raw_body,hashlib.sha256).hexdigest()

    if expected_signature != signature:
        return Response(content="fail", status_code=400)

    try:
        event = json.loads(raw_body.decode())
    except Exception:
        return Response(content="invalid payload", status_code=400)

    if event.get("event") != "payment.captured":
        return Response(content="ignored", status_code=200)

    entity = event["payload"]["payment"]["entity"]

    order_id = entity["order_id"]
    payment_id = entity["id"]
    amount = entity["amount"]
    created_at = entity["created_at"]

    result = await db.execute(select(Fee).where(Fee.payment_id == order_id,Fee.status == FeeStatusEnum.Pending))

    fee = result.scalar_one_or_none()

    if not fee:
        return Response(content="ok", status_code=200)

    fee.status = FeeStatusEnum.Paid

    result = await db.execute(select(PaymentInfo).where(PaymentInfo.id == fee.payment_id))
    payment = result.scalar_one_or_none()

    if payment:
        payment.payment_id = payment_id
        payment.amount_paid = amount / 100
        payment.payment_date = datetime.utcfromtimestamp(created_at)
        payment.status = PaymentStatusEnum.Success

    await db.commit()
    return Response(content="ok", status_code=200)
