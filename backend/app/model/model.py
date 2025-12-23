from app.db.base import Base
from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime,Boolean
from sqlalchemy import Enum as SAEnum
from datetime import datetime
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
    ADMIN = "ADMIN"
    STUDENT = "STUDENT"
    TEACHER = "TEACHER"
    PARENT = "PARENT"

class PaymentStatusEnum(str, Enum):
    Initiated = "Initiated"
    Success = "Success"
    Failed = "Failed"

class FeeStatusEnum(str, Enum):
    Paid = "Paid"
    Pending = "Pending"


class AuthProviderEnum(str, Enum):
    password = "password"    
    google = "google"          


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    auth_provider = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    password = Column(String, nullable=False)
    role = Column(SAEnum(RoleEnum), nullable=False)

class UserAuthProviders(Base):
    __tablename__ = "userauthprovider"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider = Column(String, nullable=False)
    provider_uid = Column(String, nullable=False)    


class Class(Base):
    __tablename__ = "class"

    id = Column(Integer, primary_key=True, index=True)
    classname = Column(String, nullable=False)
    section = Column(String, default="A")
    teacher_id = Column(Integer, ForeignKey("teacher.id"))


class Student(Base):
    __tablename__ = "student"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rollnumber = Column(String, unique=True, nullable=False)
    class_id = Column(Integer, ForeignKey("class.id"), nullable=False)
    stream = Column(String)
    parent_id = Column(Integer, ForeignKey("parent.id"))
    is_active = Column(Boolean, default=True)


class Teacher(Base):
    __tablename__ = "teacher"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    experience = Column(Integer, default=0)
    qualification = Column(String)
    is_active = Column(Boolean, default=True)


class Parent(Base):
    __tablename__ = "parent"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    phonenumber = Column(String, unique=True, nullable=False)


class Subject(Base):
    __tablename__ = "subject"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    class_id = Column(Integer, ForeignKey("class.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teacher.id"))



class Exam(Base):
    __tablename__ = "exam"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)


class Result(Base):
    __tablename__ = "result"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exam.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subject.id"), nullable=False)
    marks = Column(Integer, nullable=False)


class Marks(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exam.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subject.id"), nullable=False)
    marks_obtained = Column(Integer, nullable=False)


class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("class.id"), nullable=False)
    day = Column(SAEnum(DayEnum), nullable=False)
    subject_id = Column(Integer, ForeignKey("subject.id"), nullable=False)


class PaymentInfo(Base):
    __tablename__ = "payment_info"

    id = Column(String, primary_key=True, index=True)
    payment_id = Column(String)
    signature = Column(String)
    amount_paid = Column(Float)
    payment_date = Column(DateTime, default=datetime.utcnow)
    status = Column(SAEnum(PaymentStatusEnum), default=PaymentStatusEnum.Initiated, nullable=False)


class Fee(Base):
    __tablename__ = "fees"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id"), nullable=False)
    amount = Column(Float, nullable=False)
    due_date = Column(DateTime, nullable=False)
    status = Column(SAEnum(FeeStatusEnum), default=FeeStatusEnum.Pending, nullable=False)
    payment_id = Column(String, ForeignKey("payment_info.id"))


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(SAEnum(AttendanceStatusEnum), nullable=False)
