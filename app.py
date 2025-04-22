from flask import Flask, render_template, request, flash, redirect, url_for, jsonify
import pickle
import numpy as np
import os, json
from google import genai
import traceback # For detailed error logging
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime
from pymongo.server_api import ServerApi

# Load environment variables from .env file
load_dotenv()

# --- Load the Model ---
# Ensure 'model.pkl' is in the same directory as app.py
model = pickle.load(open('model.pkl', 'rb'))

# --- Initialize Clients ---
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# --- Connect to MongoDB ---
uri = os.getenv("MONGODB_URI")
mongo_client = MongoClient(uri, server_api=ServerApi('1'))
db = mongo_client["stress_monitor_db"]
responses_collection = db["form_responses"]  # Collection to store user responses

# Send a ping to confirm a successful connection
try:
    mongo_client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# --- Initialize Flask App ---
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "default_secret_key")  # For flash messages

# --- Route for the Home Page (displaying the form) ---
@app.route('/')
def man():
    """Renders the input form."""
    return render_template('home.html')

@app.route('/predict', methods=['POST'])
def home():
    try:
        form_data = {
            'gender': int(request.form['a']),
            'age': int(request.form['b']),
            'occupation': int(request.form['c']),
            'activity_level': int(request.form['d']),
            'sleep_quality': int(request.form['e']),
            'sleep_duration': float(request.form['f']),
            'bmi_category': int(request.form['g']),
            'heart_rate': int(request.form['h']),
            'daily_steps': int(request.form['i']),
            'blood_pressure': int(request.form['j'])
        }

        # Create the NumPy array with numerical data
        arr = np.array([[form_data['gender'], form_data['age'], form_data['occupation'],
                        form_data['activity_level'], form_data['sleep_quality'], form_data['sleep_duration'],
                        form_data['bmi_category'], form_data['heart_rate'], form_data['daily_steps'],
                        form_data['blood_pressure']]])

        # Make prediction
        pred = model.predict(arr)
        
        # Build a prompt that includes all form data and the predicted stress level
        prompt = (
            f"User provided the following values: Gender: {form_data['gender']} (1: Male, 0: Female), "
            f"Age: {form_data['age']}, Job: {form_data['occupation']} (Scientist=0, Doctor=1, Accountant=2, Teacher=3, Manager=4, Engineer=5, Sales Representative=6, Salesperson=7, Lawyer=8, Software Engineer=9, Nurse=10), "
            f"Activity Level: {form_data['activity_level']} (Low=1, Medium=2, High=3), "
            f"Sleep Quality Rating (1 to 10): {form_data['sleep_quality']}, Sleep Duration (hours): {form_data['sleep_duration']}, "
            f"BMI category (1: Underweight, 2: Normal, 3: Overweight): {form_data['bmi_category']}, "
            f"Heart Rate (bpm): {form_data['heart_rate']}, Daily Steps: {form_data['daily_steps']}, "
            f"Systolic Blood Pressure (mmHg): {form_data['blood_pressure']}. "
            f"The predicted stress level is {pred[0]} out of 8. "
            "Provide personalized advice to help the user manage stress, divided into exactly 4 separate categories: "
            "1. SLEEP: advice about sleep habits and quality "
            "2. ACTIVITY: advice about physical activity and exercise "
            "3. DIET: advice about nutrition and eating habits "
            "4. MINDFULNESS: advice about mental well-being and stress reduction techniques. "
            "For each category, provide 1-2 concise, actionable recommendations (no more than 50 words per category). "
            "Format your response as a JSON string with this exact structure: "
            "{'sleep': 'sleep advice here', 'activity': 'activity advice here', 'diet': 'diet advice here', 'mindfulness': 'mindfulness advice here'}"
            "No extra text or explanations - just the JSON object."
        )
        # Print the prompt for debugging
        print(f"Prompt sent to Gemini: {prompt}")
        
        # Call Gemini's API for generating personalized advice
        try:
            res = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            advice_json = res.text.replace('```', '').replace('json', '').strip()
            
            # Try to parse the response as JSON
            try:
                advice_dict = json.loads(advice_json)
                # Ensure we have all four categories
                if not all(key in advice_dict for key in ['sleep', 'activity', 'diet', 'mindfulness']):
                    raise ValueError("Missing required categories in response")
            except (json.JSONDecodeError, ValueError) as e:
                # Fallback if JSON parsing fails
                advice_dict = {
                    'sleep': "Focus on improving your sleep quality with a consistent schedule.",
                    'activity': "Incorporate regular physical activity into your routine.",
                    'diet': "Maintain a balanced diet with plenty of water throughout the day.",
                    'mindfulness': "Practice daily mindfulness or breathing exercises to reduce stress."
                }
                print(f"Failed to parse AI response as JSON: {e}")
                print(f"Original response: {advice_json}")
        except Exception as e:
            advice_dict = {
                'sleep': "Focus on improving your sleep quality with a consistent schedule.",
                'activity': "Incorporate regular physical activity into your routine.",
                'diet': "Maintain a balanced diet with plenty of water throughout the day.",
                'mindfulness': "Practice daily mindfulness or breathing exercises to reduce stress."
            }
            print(f"AI Error: {e}")
            print(traceback.format_exc())
        
        occupation_dict = {
            0: "Scientist",
            1: "Doctor",
            2: "Accountant",
            3: "Teacher",
            4: "Manager",
            5: "Engineer",
            6: "Sales Representative",
            7: "Salesperson",
            8: "Lawyer",
            9: "Software Engineer",
            10: "Nurse"
        }

        # Store the response data in MongoDB
        response_data = {
            "timestamp": datetime.now(),
            "input_data": {
                "gender": "Male" if form_data["gender"] == 1 else "Female",
                "age": int(form_data["age"]),
                "occupation": occupation_dict.get(int(form_data["occupation"]), "Unknown"),
                "activity_level": int(form_data["activity_level"]),
                "sleep_quality": int(form_data["sleep_quality"]),
                "sleep_duration": form_data["sleep_duration"],
                "bmi_category": int(form_data["bmi_category"]),
                "heart_rate": int(form_data["heart_rate"]),
                "daily_steps": int(form_data["daily_steps"]),
                "systolic_bp": int(form_data["blood_pressure"])
            },
            "stress_level": float(pred[0]),
            "advice": advice_dict
        }
        
        # Insert into MongoDB
        try:
            responses_collection.insert_one(response_data)
        except Exception as e:
            print(f"MongoDB Error: {e}")
        
        # Render the response page with the prediction and advice
        return render_template('after.html', data=[pred[0], advice_dict])
    
    except Exception as e:
        flash(f"Error processing your request: {str(e)}")
        return redirect(url_for('home'))

# --- Route for viewing past responses ---
@app.route('/dashboard')
def dashboard():
    """Shows past responses from the database"""
    try:
        # Get the most recent 10 responses
        recent_responses = list(responses_collection.find().sort("timestamp", -1).limit(10))
        return render_template('dashboard.html', responses=recent_responses)
    except Exception as e:
        flash(f"Error retrieving data: {str(e)}")
        return render_template('dashboard.html', responses=[])

# --- Run the App ---
if __name__ == "__main__":
    # Make sure you run *this* file: python app.py
    # debug=True provides detailed errors in the browser during development
    # IMPORTANT: Set debug=False for production deployment!
    app.run(debug=True)