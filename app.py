from flask import Flask, render_template, request, jsonify
from transformers import BertForSequenceClassification, BertTokenizer
import torch
from flask_cors import CORS

app = Flask(__name__, template_folder='web', static_folder='web')
CORS(app)  # Permite todas las solicitudes de cualquier origen

# Cargar el modelo y el tokenizador para análisis de sentimientos en español
model = BertForSequenceClassification.from_pretrained("VerificadoProfesional/SaBERT-Spanish-Sentiment-Analysis")
tokenizer = BertTokenizer.from_pretrained("VerificadoProfesional/SaBERT-Spanish-Sentiment-Analysis")

# Función de predicción
def predict(text, threshold=0.5):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128)
    with torch.no_grad():
        outputs = model(**inputs)
    
    logits = outputs.logits
    probabilities = torch.softmax(logits, dim=1).squeeze().tolist()
    
    predicted_class = torch.argmax(logits, dim=1).item()
    if probabilities[predicted_class] <= threshold and predicted_class == 1:
        predicted_class = 0  # Ajuste basado en el umbral

    return "positivo" if predicted_class == 1 else "negativo", probabilities[predicted_class]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get("text", "")
    label, score = predict(text)
    return jsonify({
        "label": label,
        "score": score
    })

if __name__== '__main__':
    app.run(host="0.0.0.0",port=5000)









