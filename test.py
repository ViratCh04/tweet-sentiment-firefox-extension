import requests

response = requests.post(
    "http://localhost:8000/predict",
    json={"text": "I feel super negative!"}
)
print(response.json())