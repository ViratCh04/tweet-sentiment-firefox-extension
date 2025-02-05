from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sentiment Analysis API")

# CORS middleware 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  #Allow all methods
    allow_headers=["*"]   #Allow all headers
)

try:
    with open('model.pkl', 'rb') as f:
        nb = pickle.load(f)
    with open('vectoriser.pkl', 'rb') as f:
        vectorizer = pickle.load(f)
except FileNotFoundError:
    raise Exception("Model or vectorizer files not found. Ensure model.pkl and vectorizer.pkl exist.")

# request/response models
class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: str
    probability: float
    
@app.post("/predict", response_model=SentimentResponse)
async def predict_sentiment(request: SentimentRequest):
    try:
        # Transform the text using vectorizer
        text_transformed = vectorizer.transform([request.text])
        
        prediction = nb.predict(text_transformed)[0]
        probability = max(nb.predict_proba(text_transformed)[0])
        
        # Convert prediction to label
        sentiment = "positive" if prediction == 1 else "negative"
        
        return SentimentResponse(
            sentiment=sentiment,
            probability=float(probability)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Welcome to the Sentiment Analysis API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
