from PIL import Image
import numpy as np
try:
    import pydicom
except ImportError:
    pydicom = None






def preprocess_image(image_file, image, cancer_type="oral"):
    try:
        if cancer_type == "breast" and image.content_type == "image/dicom":
            if not pydicom:
                raise Exception("DICOM support requires pydicom")
            dicom = pydicom.dcmread(image_file)
            image = dicom.pixel_array
            image = ((image - image.min()) / (image.max() - image.min()) * 255).astype(np.uint8)
            image = Image.fromarray(image).convert("RGB")
        else:
            image = Image.open(image_file).convert("RGB")

        if cancer_type == "oral":
            image = image.resize((224, 224), Image.LANCZOS)  # Adjust size as needed
            image_array = np.array(image) / 255.0  # Normalize to [0, 1]
            image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
            return image_array
        elif cancer_type == "skin":
            image = image.resize((128, 128), Image.LANCZOS)  # Adjust size as needed
            image_array = np.array(image) / 255.0  # Normalize to [0, 1]
            image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
            return image_array
        elif cancer_type == "breast":
            image = image.resize((224, 224), Image.LANCZOS)
            image_array = np.array(image).astype(np.float32) / 255.0  # Normalize to [0, 1]
            image_array = image_array.transpose(2, 0, 1)  # Convert HWC -> CHW
            image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension -> (1, 3, 224, 224)
            return image_array
        elif cancer_type == "brain":
            image = image.resize((128, 128), Image.LANCZOS)  # Adjust size as needed
            image_array = np.array(image) / 255.0  # Normalize to [0, 1]
            image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
            return image_array
        elif cancer_type == "chest":
            image = image.resize((224, 224), Image.LANCZOS)  # Adjust size as needed
            image_array = np.array(image) / 255.0  # Normalize to [0, 1]
            image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
            return image_array
        else:
            raise Exception(f"Unsupported cancer type: {cancer_type}")
    except Exception as e:
        raise Exception(f"Error preprocessing image: {str(e)}")

def predict_image(model, image_array, cancer_type="oral"):
    try:
        if cancer_type == "oral":
            input_name = model.get_inputs()[0].name
            output_name = model.get_outputs()[0].name
            predictions = model.run([output_name], {input_name: image_array.astype(np.float32)})
            class_label = "Oral Cancer" if float(predictions[0][0][0]) < 0.5 else "Normal"
            confidence = float(predictions[0][0][0]) if class_label == "Normal" else 1 - float(predictions[0][0][0])

        elif cancer_type == "skin":
            input_name = model.get_inputs()[0].name
            output_name = model.get_outputs()[0].name
            predictions = model.run([output_name], {input_name: image_array.astype(np.float32)})
            predicted_class_index = np.argmax(predictions[0], axis=1)[0]
            confidence = float(np.max(predictions[0], axis=1)[0])
            class_labels = [
                'melanoma', 'pigmented benign keratosis', 'vascular lesion',
                'actinic keratosis', 'squamous cell carcinoma', 'basal cell carcinoma',
                'seborrheic keratosis', 'dermatofibroma', 'nevus'
            ]
            class_label = class_labels[predicted_class_index]

        elif cancer_type == "brain":
            input_name = model.get_inputs()[0].name
            output_name = model.get_outputs()[0].name
            predictions = model.run([output_name], {input_name: image_array.astype(np.float32)})
            predicted_class_index = np.argmax(predictions[0], axis=1)[0]
            confidence = float(np.max(predictions[0], axis=1)[0])
            class_labels = ['pituitary', 'glioma', 'notumor', 'meningioma']
            class_label = class_labels[predicted_class_index] if class_labels[predicted_class_index] != 'notumor' else "Normal"

        elif cancer_type == "chest":
            input_name = model.get_inputs()[0].name
            output_name = model.get_outputs()[0].name
            predictions = model.run([output_name], {input_name: image_array.astype(np.float32)})
            predicted_class_index = np.argmax(predictions[0], axis=1)[0]
            confidence = float(np.max(predictions[0], axis=1)[0])
            class_labels = ['COVID', 'Normal', 'PNEUMONIA']
            class_label = class_labels[predicted_class_index]

        elif cancer_type == "breast":
           image_tensor = image_array.astype(np.float32)
           input_name = model.get_inputs()[0].name
           output_name = model.get_outputs()[0].name
           predictions = model.run([output_name], {input_name: image_tensor})
           # Convert logits to probabilities using softmax
           logits = predictions[0][0]  # shape: (2,)
           exp_logits = np.exp(logits - np.max(logits))  # for numerical stability
           probabilities = exp_logits / np.sum(exp_logits)

           predicted_class = int(np.argmax(probabilities))
           confidence = float(np.max(probabilities))
           class_label = "Malignant" if predicted_class == 1 else "Benign"
        else:
            raise Exception(f"Unsupported cancer type: {cancer_type}")

        return {
            "class_label": class_label,
            "confidence": confidence
        }
    except Exception as e:
        raise Exception(f"Error predicting image: {str(e)}")