from transformers import AutoTokenizer, AutoModel

# Nombre del modelo
model_name = "dccuchile/bert-base-spanish-wwm-cased"

# Cargar el tokenizador y el modelo
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# Ejemplo de tokenización de texto
text = "Hola, ¿cómo estás?"
inputs = tokenizer(text, return_tensors="pt")  # Devuelve tensores para PyTorch
outputs = model(**inputs)

print(outputs)


