from pydantic import BaseModel, EmailStr, ConfigDict, Field
from datetime import datetime
from typing import Optional
from enum import Enum

class DayEnum(str, Enum):
    Monday = "Monday"
    Tuesday = "Tuesday"
    Wednesday = "Wednesday"
    Thursday = "Thursday"
    Friday = "Friday"
    Saturday = "Saturday"


class AttendanceStatusEnum(str, Enum):
    Present = "Present"
    Absent = "Absent"
    Late = "Late"


class RoleEnum(str, Enum):
    ADMIN='ADMIN'
    STUDENT='STUDENT'
    TEACHER='TEACHER'
    PARENT='PARENT'


class PaymentStatusEnum(str, Enum):
    Initiated = "Initiated"
    Success = "Success"
    Failed = "Failed"


class FeeStatusEnum(str, Enum):
    Paid = "Paid"
    Pending = "Pending"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: RoleEnum
    full_name: Optional[str] = None




class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: RoleEnum

    model_config = ConfigDict(from_attributes=True)


class ClassCreate(BaseModel):
    classname: str
    section: Optional[str] = "A"


class ClassResponse(ClassCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class StudentCreate(BaseModel):
    user_id: int
    rollnumber: str
    class_id: int
    stream: Optional[str] = None
    parent_id: Optional[int] = None


class StudentResponse(StudentCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class TeacherCreate(BaseModel):
    user_id: int
    experience: int = 0
    qualification: Optional[str] = None


class TeacherResponse(TeacherCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ParentCreate(BaseModel):
    user_id: int
    phonenumber: str


class ParentResponse(ParentCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class SubjectCreate(BaseModel):
    name: str
    class_id: int
    teacher_id: Optional[int] = None


class SubjectResponse(SubjectCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ExamCreate(BaseModel):
    name: str
    date: datetime            
    subject: str
    classname: str = Field(alias="className")

    model_config = ConfigDict(populate_by_name=True)


class ExamResponse(BaseModel):
    id: int
    name: str
    date: datetime
    subject_id: int

    model_config = ConfigDict(from_attributes=True)



class ResultCreate(BaseModel):
    student_id: int
    exam_id: int
    subject_id: int
    marks: int


class ResultResponse(ResultCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class MarksCreate(BaseModel):
    student_id: int
    exam_id: int
    subject_id: int
    marks_obtained: int


class MarksResponse(MarksCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class TimetableCreate(BaseModel):
    class_id: int
    day: DayEnum
    subject_id: int


class TimetableResponse(TimetableCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class PaymentInfoCreate(BaseModel):
    payment_id: Optional[str] = None
    signature: Optional[str] = None
    amount_paid: Optional[float] = None
    status: PaymentStatusEnum = PaymentStatusEnum.Initiated


class PaymentInfoResponse(BaseModel):
    id: str
    payment_id: Optional[str] = None
    signature: Optional[str] = None
    amount_paid: Optional[float] = None
    payment_date: datetime
    status: PaymentStatusEnum

    model_config = ConfigDict(from_attributes=True)



class FeeCreate(BaseModel):
    student_id: int
    amount: float
    due_date: datetime


class FeeResponse(FeeCreate):
    id: int
    status: FeeStatusEnum
    model_config = ConfigDict(from_attributes=True)

class AttendanceCreate(BaseModel):
    student_id: int
    status: AttendanceStatusEnum


class AttendanceResponse(AttendanceCreate):
    id: int
    date: datetime
    model_config = ConfigDict(from_attributes=True)

class CreateChallanRequest(BaseModel):
    amount: float
    due_date: datetime
    rollnumber: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    fee_id: int

class NotificationCreate(BaseModel):
    title: str
    message: str
    target_roles: list[RoleEnum]    


class CreateChallanRequest(BaseModel):
    amount: float
    due_date: datetime
    rollnumber: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    fee_id: int
