from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from typing import Dict
import os
from utils import preprocess_image, predict_image
import uvicorn
import onnxruntime as ort

load_dotenv()


app = FastAPI()
frontend = os.getenv("FRONTEND_URL")
print(frontend)
# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Paths
ORAL_MODEL_PATH = "models/oral_fixed.onnx"
# BREAST_MODEL_PATH = "models/breast.pth"
SKIN_MODEL_PATH = "models/skin.onnx"
MRI_MODEL_PATH = "models/new_mrimodel.onnx"
XRAY_MODEL_PATH = "models/x_ray.onnx"


# Load TensorFlow models
oral_model = ort.InferenceSession(ORAL_MODEL_PATH, compile=False)
skin_model = ort.InferenceSession(SKIN_MODEL_PATH, compile=False)
mri_model = ort.InferenceSession(MRI_MODEL_PATH, compile=False)
xray_model = ort.InferenceSession(XRAY_MODEL_PATH, compile=False)



# Store models in a dict
MODELS: Dict[str, Dict] = {
    "oral": {"type": "onnx", "model": oral_model},
    # "breast": {"type": "pytorch", "model": breast_model},
    "skin": {"type": "onnx", "model": skin_model},
    "brain": {"type": "onnx", "model": mri_model},
    "chest": {"type": "onnx", "model": xray_model},
}

@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    type: str = Form(...),

):
    cancer_type = type.lower()
    if cancer_type not in MODELS:
        return JSONResponse(
            status_code=400,
            content={"error": f"Model for {cancer_type} is not available"},
        )
    try:
        result = predict_image(
            MODELS[cancer_type]["model"],
            preprocess_image(image.file,image, cancer_type),
            cancer_type
        )
        return result
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# health check by digital ocean
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Uvicorn command will run this file
if __name__ == "__main__":
    os.makedirs("uploads", exist_ok=True)
    uvicorn.run("app:app", host="0.0.0.0", port=8080, reload=True)
