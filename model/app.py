from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from typing import Dict
import os
import tensorflow as tf
import torch
import torch.nn as nn
from transformers import FlavaProcessor, FlavaModel
from utils import preprocess_image, predict_image
import requests
import uvicorn

load_dotenv()

os.environ["CUDA_VISIBLE_DEVICES"] = ""

# Set TensorFlow to CPU & avoid allocating full memory
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        tf.config.experimental.set_memory_growth(gpus[0], True)
    except RuntimeError as e:
        print(e)

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def download_if_not_exists(url, local_path):
    if not os.path.exists(local_path):
        print(f"Downloading {local_path} from {url}")
        response = requests.get(url)
        if response.status_code == 200:
            with open(local_path, "wb") as f:
                f.write(response.content)
        else:
            raise Exception(f"Failed to download {local_path}: {response.status_code}")

# Create model directory
os.makedirs("models", exist_ok=True)

# Download model files if not present
download_if_not_exists(os.getenv("ORAL_MODEL"), "models/oral_fixed.h5")
download_if_not_exists(os.getenv("BREAST_MODEL"), "models/breast.pth")
download_if_not_exists(os.getenv("SKIN_MODEL"), "models/skin.h5")
download_if_not_exists(os.getenv("MRI_MODEL"), "models/new_mrimodel.h5")
download_if_not_exists(os.getenv("XRAY_MODEL"), "models/x_ray.h5")

# Paths
ORAL_MODEL_PATH = "models/oral_fixed.h5"
BREAST_MODEL_PATH = "models/breast.pth"
SKIN_MODEL_PATH = "models/skin.h5"
MRI_MODEL_PATH = "models/new_mrimodel.h5"
XRAY_MODEL_PATH = "models/x_ray.h5"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load TensorFlow models
oral_model = tf.keras.models.load_model(ORAL_MODEL_PATH, compile=False)
skin_model = tf.keras.models.load_model(SKIN_MODEL_PATH, compile=False)
mri_model = tf.keras.models.load_model(MRI_MODEL_PATH, compile=False)
xray_model = tf.keras.models.load_model(XRAY_MODEL_PATH, compile=False)

# Load PyTorch FLAVA model
model_name = "facebook/flava-full"
processor = FlavaProcessor.from_pretrained(model_name)
flava_model = FlavaModel.from_pretrained(model_name).to(DEVICE)

class FlavaClassifier(nn.Module):
    def __init__(self, model, num_classes=2):
        super(FlavaClassifier, self).__init__()
        self.flava = model
        self.classifier = nn.Linear(768, num_classes)

    def forward(self, pixel_values):
        outputs = self.flava(pixel_values=pixel_values)
        image_embedding = outputs.image_embeddings[:, 0, :]
        logits = self.classifier(image_embedding)
        return logits

breast_model = FlavaClassifier(flava_model).to(DEVICE)
breast_model.load_state_dict(torch.load(BREAST_MODEL_PATH, map_location=DEVICE))
breast_model.eval()

# Store models in a dict
MODELS: Dict[str, Dict] = {
    "oral": {"type": "tensorflow", "model": oral_model},
    "breast": {"type": "pytorch", "model": breast_model},
    "skin": {"type": "tensorflow", "model": skin_model},
    "brain": {"type": "tensorflow", "model": mri_model},
    "chest": {"type": "tensorflow", "model": xray_model},
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


# Uvicorn command will run this file
if __name__ == "__main__":
    os.makedirs("uploads", exist_ok=True)
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
