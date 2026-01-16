from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config.firebase import init_firebase
from app.routes.auth import router as auth_router
from app.routes.student import router as student_router
from app.routes.class_ import router as class_router
from app.routes.parent import router as parent_router
from app.routes.teacher import router as teacher_router
from app.routes.subject import router as subject_router
from app.routes.exam import router as exam_router
from app.routes.result import router as result_router
from app.routes.admin import router as admin_router
from app.routes.fees import router as fees_router
from app.routes.notification import router as notification_router
from app.routes.timetable import router as timetable_router
from app.routes.webhook import router as webhook_router
from app.routes.ws_manager import WebSocketManager
from dotenv import load_dotenv
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_firebase()
    app.state.ws_manager = WebSocketManager()  
    yield

app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(class_router)
app.include_router(parent_router)
app.include_router(teacher_router)
app.include_router(subject_router)
app.include_router(exam_router)
app.include_router(result_router)
app.include_router(admin_router)
app.include_router(fees_router)
app.include_router(notification_router)
app.include_router(timetable_router)
app.include_router(webhook_router)


@app.get("/")
def root():
    return {"message": "API running"}
