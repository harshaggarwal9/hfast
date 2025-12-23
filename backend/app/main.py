from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.base import Base
from app.db.session import engine
from app.config.firebase import init_firebase

from app.routes.auth import router as auth_router
from app.routes.student import router as student_router
from app.routes.class_ import router as class_router
from app.routes.parent import router as parent_router
from app.routes.teacher import router as teacher_router
from app.routes.subject import router as subject_router
from app.routes.exam import router as exam_router
from app.routes.result import router as result_router



async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    init_firebase()
    yield


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router, prefix="/api/auth")
app.include_router(student_router, prefix="/api/student")
app.include_router(class_router, prefix="/api/class")
app.include_router(parent_router, prefix="/api/parent")
app.include_router(teacher_router, prefix="/api")
app.include_router(subject_router, prefix="/api/subject")
app.include_router(exam_router, prefix="/api/exam")
app.include_router(result_router, prefix="/api/result")


@app.get("/")
def root():
    return {"message": "API running"}
