
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional
from pathlib import Path
import uuid

from database import init_db, insert_item, get_items
from matching import find_matches

app = FastAPI(
    title="FindIt AI",
    description="AI-powered Lost and Found Matching Agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload folder
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Make uploaded images accessible
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def home():
    return {
        "message": "FindIt AI is running successfully!"
    }


@app.get("/api/health")
def health():
    return {
        "status": "success",
        "message": "Backend connected successfully"
    }


@app.post("/api/items")
async def create_item(
    item_type: str = Form(...),
    item_name: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    item_date: Optional[str] = Form(None),
    contact: Optional[str] = Form(None),
    item_image: Optional[UploadFile] = File(None)
):

    if item_type.lower() not in ["lost", "found"]:
        raise HTTPException(400, "Invalid item type")

    image_filename = None

    if item_image and item_image.filename:
        if not item_image.content_type or not item_image.content_type.startswith("image/"):
            raise HTTPException(400, "Please upload a valid image")

        extension = Path(item_image.filename).suffix.lower()

        if extension not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            raise HTTPException(400, "Unsupported image format")

        image_filename = f"{uuid.uuid4().hex}{extension}"

        image_path = UPLOAD_DIR / image_filename

        image_data = await item_image.read()

        if len(image_data) > 5 * 1024 * 1024:
            raise HTTPException(400, "Image must be smaller than 5 MB")

        image_path.write_bytes(image_data)

    item_data = {
        "item_type": item_type.lower(),
        "item_name": item_name.strip(),
        "category": category.strip(),
        "description": description.strip(),
        "location": location.strip(),
        "item_date": item_date or None,
        "image_filename": image_filename,
        "contact": contact
    }

    item_id = insert_item(item_data)

    return {
        "status": "success",
        "message": "Item reported successfully",
        "item_id": item_id,
        "image_filename": image_filename
    }


@app.get("/api/items")
def read_items():
    items = get_items()

    return {
        "status": "success",
        "total_items": len(items),
        "items": items
    }


@app.get("/api/matches")
def get_matches():
    items = get_items()
    matches = find_matches(items)

    return {
        "status": "success",
        "total_matches": len(matches),
        "matches": matches
    }
from pathlib import Path
import shutil

UPLOAD_DIR = Path(__file__).with_name("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):

    allowed_types = ["image/jpeg", "image/png", "image/webp"]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed"
        )

    filename = Path(file.filename or "image").name
    image_path = UPLOAD_DIR / filename

    with image_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "status": "success",
        "filename": filename,
        "message": "Image uploaded successfully"
    }