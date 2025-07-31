from flask import Flask, render_template, request, jsonify
from transformers import BertForSequenceClassification, BertTokenizer
import torch
import os
import json
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
    

# Ruta al archivo JSON
COMMENTS_FILE = 'comentarios.json'

# Cargar comentarios del archivo JSON
def load_comments():
    if not os.path.exists(COMMENTS_FILE):
        return []
    with open(COMMENTS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

# Guardar comentarios en el archivo JSON
def save_comment(comment):
    comments = load_comments()
    comments.append(comment)
    with open(COMMENTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(comments, f, ensure_ascii=False, indent=2)

@app.route('/comment', methods=['POST'])
def comment():
    data = request.get_json()
    text = data.get("text", "")
    materia = data.get("materia", "")
    label, score = predict(text)
    
    comment_data = {
        "text": text,
        "materia": materia,
        "sentiment": label,
        "score": score
    }

    save_comment(comment_data)

    return jsonify({"success": True, "comment": comment_data})

@app.route('/comments', methods=['GET'])
def get_comments():
    return jsonify(load_comments())

@app.route('/clear_comments', methods=['POST'])
def clear_comments():
    with open(COMMENTS_FILE, 'w', encoding='utf-8') as f:
        f.write('[]')
    return jsonify({"success": True})




if __name__== '__main__':
    app.run(host="0.0.0.0",port=5000)
