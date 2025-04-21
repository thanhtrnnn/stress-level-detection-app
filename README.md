# Stress & Health Detection App

A web application for stress assessment and health recommendations, built with Flask and machine learning. Users fill out a Typeform-like interactive form, and the app predicts their stress level and provides personalized advice.

## Features
- **Visually interactive form**<br/>
  One-question-at-a-time, keyboard/mouse navigation, progress bar, and validation.
- **ML-powered stress prediction**<br/>
  Uses a trained model (`model.pkl`) to predict stress level from user input.
- **Personalized advice**<br/>
  Integrates with Gemini API to generate actionable advice in four categories: Sleep, Activity, Diet, Mindfulness.
- **Dashboard**<br/>
  View recent responses and stress levels.
- **MongoDB integration**<br/>
  Stores user responses and predictions.

## Technologies Used
- Python 3, Flask
- HTML, CSS (custom + Bootstrap), JavaScript (with jQuery)
- Machine Learning model (pickle file)
- Google Gemini API (for advice)
- MongoDB (for storing responses)

## Setup Instructions
1. **Clone the repository**
2. **Install dependencies**
   - Python packages: `flask`, `numpy`, `pymongo`, `python-dotenv`, `google-genai` (see your `requirements.txt` or install manually)
3. **Environment variables**
   - Copy `.env` and set your `GEMINI_API_KEY` and `MONGODB_URI`.
4. **Model file**
   - Place your trained `model.pkl` in the project root.
5. **Run the app**
   - `python app.py`
   - Visit `http://localhost:5000` in your browser.

## Customization
- **Model**: Replace `model.pkl` with your own trained model (ensure input order matches form fields).
- **Advice logic**: Modify the prompt in `app.py` for different advice categories or formats.

## Credits
- @DrakePhamta for the pre-trained model.
- UI inspired by Typeform.
- Bootstrap ultilization including layouts, spacing and icons. 

