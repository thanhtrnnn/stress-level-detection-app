# Stress Level Detection App

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

# Heroku Deployment Instructions

## 1. Prerequisites
- You have a [Heroku](https://heroku.com) account and the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed.
- You have a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster set up.

## 2. MongoDB Atlas Connection String
1. Go to your MongoDB Atlas dashboard.
2. Click "Connect" > "Connect your application".
3. Copy the connection string. It looks like:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

4. Replace `<username>` and `<password>` with your Atlas database user credentials.
5. Add your current IP or 0.0.0.0/0 to the Atlas Network Access whitelist.

## 3. Prepare Your App for Heroku
- Make sure you have these files in your project root:
  - `Procfile`
  - `requirements.txt`
  - `runtime.txt`
  - `app.py` (main entry point)
  - `model.pkl` (your ML model)

## 4. Deploy to Heroku
```sh
heroku login
heroku create your-app-name
heroku buildpacks:set heroku/python
heroku addons:create mongolab:sandbox  # (optional, if you want Heroku MongoDB)
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main  # or 'git push heroku master' if using master branch
```

## 5. Set Environment Variables on Heroku
```sh
heroku config:set MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
heroku config:set GEMINI_API_KEY="your-gemini-api-key"
```

## 6. Open Your App
```sh
heroku open
```

## Notes
- Your Flask app will be served by Gunicorn via the `Procfile`.
- All secrets (API keys, DB URIs) should be set via Heroku config vars, not in code.
- If you update your code, just commit and push to Heroku again.

