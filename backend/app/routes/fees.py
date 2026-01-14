from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.db.session import get_async_db
from app.model.model import Fee, Student, FeeStatusEnum, PaymentInfo, RoleEnum
from app.dependencies.role import require_roles
from app.utils.razorpay import razorpay_client
from app.schema.schema import CreateChallanRequest, VerifyPaymentRequest
from datetime import datetime
import hmac
import hashlib
import os


router = APIRouter(prefix="/fees", tags=["Fees"])


@router.post("/challan")
async def create_challan(data: CreateChallanRequest,db: AsyncSession = Depends(get_async_db),current_user=Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(Student).where(Student.rollnumber == data.rollnumber))
    student = result.scalar_one_or_none()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    fee = Fee(
        student_id=student.id,
        amount=data.amount,
        due_date=data.due_date,
        status=FeeStatusEnum.Pending
    )

    db.add(fee)
    await db.commit()
    await db.refresh(fee)
    return fee

@router.post("/initiate-payment/{fee_id}")
async def initiate_payment(fee_id: int,db: AsyncSession = Depends(get_async_db),current_user=Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(Fee).where(Fee.id == fee_id))
    fee = result.scalar_one_or_none()

    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")

    order = razorpay_client.order.create({
        "amount": int(fee.amount * 100),
        "currency": "INR",
        "receipt": f"receipt_{fee.id}",
        "payment_capture": 1,
    })

    payment = PaymentInfo(
        id=order["id"],
        payment_id=order["id"],
        amount_paid=fee.amount,
        status="Initiated"
    )

    db.add(payment)
    fee.payment_id = payment.id
    await db.commit()

    return {
        "orderId": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "feeId": fee.id,
        "razorpayKey": os.getenv("RAZORPAY_KEY_ID"),
    }


@router.post("/verify-payment")
async def verify_payment(data: VerifyPaymentRequest,db: AsyncSession = Depends(get_async_db)):

    body = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"

    expected_signature = hmac.new(
        os.getenv("RAZORPAY_SECRET").encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()

    if expected_signature != data.razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid signature")

    result = await db.execute(select(Fee).where(Fee.id == data.fee_id))
    fee = result.scalar_one_or_none()

    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")

    fee.status = FeeStatusEnum.Paid

    result = await db.execute(select(PaymentInfo).where(PaymentInfo.id == fee.payment_id))
    payment = result.scalar_one()

    payment.signature = data.razorpay_signature
    payment.payment_date = datetime.utcnow()
    payment.status = "Success"

    await db.commit()

    return {"message": "Payment verified and fee updated"}

@router.get("/pending")
async def fetch_pending_fees(db: AsyncSession = Depends(get_async_db),current_user=Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(Fee).where(Fee.status == FeeStatusEnum.Pending))
    fees = result.scalars().all()
    return fees

@router.delete("/{fee_id}")
async def delete_challan(fee_id: int,db: AsyncSession = Depends(get_async_db),current_user=Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(Fee).where(Fee.id == fee_id))
    fee = result.scalar_one_or_none()

    if not fee:
        raise HTTPException(status_code=404, detail="Challan not found")

    await db.delete(fee)
    await db.commit()

    return {"message": "Challan deleted successfully"}




