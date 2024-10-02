from flask import Flask, request, jsonify
import joblib
import requests
import os
from marshmallow import Schema, fields
import json
from flask import Response

class CropRecommendationRequest(Schema):
    N = fields.Integer(required=True, validate=lambda n: 0 <= n <= 300)
    P = fields.Integer(required=True, validate=lambda p: 0 <= p <= 300)
    K = fields.Integer(required=True, validate=lambda k: 0 <= k <= 300)
    ph = fields.Float(required=True, validate=lambda ph: 0.0 <= ph <= 14.0)
    city = fields.Str(required=True)
    month = fields.Str(required=True)

app = Flask(__name__)

model = joblib.load('model/crop_recommendation_model.joblib')

# API configuration (use environment variable)
weather_api_url = "https://pro.openweathermap.org/data/2.5/forecast/climate?"
weather_api_key = "11b7045be8d68cc7bc70d1fcd0769d0f " # Fetching API key from environment

city_coordinates_india = {
    "New Delhi": (28.6139, 77.2090, 216),
    "Mumbai": (19.0760, 72.8777, 14),
    "Kolkata": (22.5726, 88.3639, 9),
    "Chennai": (13.0827, 80.2707, 6),
    "Bengaluru": (12.9716, 77.5946, 920),
    "Hyderabad": (17.3850, 78.4867, 542),
    "Pune": (18.5204, 73.8567, 560),
    "Ahmedabad": (23.0225, 72.5714, 53),
    "Jaipur": (26.9124, 75.7873, 431),
    "Lucknow": (26.8467, 80.9462, 123),
    "Kanpur": (26.4499, 80.3319, 126),
    "Nagpur": (21.1458, 79.0882, 310),
    "Indore": (22.7196, 75.8577, 553),
    "Thane": (19.2183, 72.9781, 7),
    "Bhopal": (23.2599, 77.4126, 527),
    "Visakhapatnam": (17.6868, 83.2185, 45),
    "Patna": (25.5941, 85.1376, 53),
    "Vadodara": (22.3072, 73.1812, 39),
    "Ghaziabad": (28.6692, 77.4538, 213),
    "Ludhiana": (30.9009, 75.8573, 244)
}

month_dates = {
    "January": ("01-01", "01-31"),
    "February": ("02-01", "02-28"),
    "March": ("03-01", "03-31"),
    "April": ("04-01", "04-30"),
    "May": ("05-01", "05-31"),
    "June": ("06-01", "06-30"),
    "July": ("07-01", "07-31"),
    "August": ("08-01", "08-31"),
    "September": ("09-01", "09-30"),
    "October": ("10-01", "10-31"),
    "November": ("11-01", "11-30"),
    "December": ("12-01", "12-31")
}

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Crop Recommendation API!"})


def get_coordinates(city_name):
    return city_coordinates_india.get(city_name, (None, None, None))

def get_month_dates(month_name):
    if month_name in month_dates:
        start_date, end_date = month_dates[month_name]
        return f"2023-{start_date}", f"2023-{end_date}"
    else:
        return None, None
      
def kelvinToCelsius(kelvin):
    return kelvin - 273.15

def get_weather_data(city, month):
    latitude, longitude, rainfall = get_coordinates(city)
    start_date, end_date = get_month_dates(month)

    if latitude is None or longitude is None:
        return {'temperature': None, 'humidity': None, 'rainfall': None}

    params = {
        "lat": latitude,
        "lon": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": "temperature_2m,relative_humidity_2m",
        "timezone": "Asia/Kolkata",
        "appid": weather_api_key  # API key is added here
    }
    
    response = requests.get(weather_api_url, params=params)

    if response.status_code == 200:
        data = response.json()
        temperature_data = data["hourly"]["temperature_2m"]
        humidity_data = data["hourly"]["relative_humidity_2m"]
    
        average_temperature = round(sum(temperature_data) / len(temperature_data), 2)
        average_humidity = round(sum(humidity_data) / len(humidity_data), 2)
    
        return {'temperature': average_temperature, 'humidity': average_humidity, 'rainfall': rainfall}
    else:
        return {'temperature': None, 'humidity': None, 'rainfall': None}

def predict_crops(features):
    prediction_proba = model.predict_proba([features])[0]
    sorted_crops = sorted(enumerate(prediction_proba), key=lambda x: x[1], reverse=True)
    return sorted_crops[:3]

def format_response(top3_crops_data):
    crop_labels = {
        "rice": "rice",
        "maize": "maize",
        "chickpea": "chickpea",
        "kidneybeans": "kidneybeans",
        "pigeonpeas": "pigeonpeas",
        "mothbeans": "mothbeans",
        "mungbean": "mungbean",
        "blackgram": "blackgram",
        "lentil": "lentil",
        "pomegranate": "pomegranate",
        "banana": "banana",
        "mango": "mango",
        "grapes": "grapes",
        "watermelon": "watermelon",
        "muskmelon": "muskmelon",
        "apple": "apple",
        "orange": "orange",
        "papaya": "papaya",
        "coconut": "coconut",
        "cotton": "cotton",
        "jute": "jute",
        "coffee": "coffee"
    }
    
    response_data = []
    for crop_index, probability in top3_crops_data:
        crop_name = crop_labels[model.classes_[crop_index]]
        response_data.append({'crop': crop_name, 'probability': round(probability, 2)})
    
    return response_data

@app.route('/recommend', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)

        schema = CropRecommendationRequest()
        errors = schema.validate(data)
        
        if errors:
            error_messages = []
            for field, error_msgs in errors.items():
                error_messages.append(f"Invalid value for {field}: {', '.join(error_msgs)}")
            return jsonify({'error': error_messages}), 400

        weather_data = get_weather_data(data['city'], data['month'])

        if weather_data['temperature'] is None or weather_data['humidity'] is None:
            return jsonify({'error': "Make sure the city name is correct"}), 400

        features = [data['N'], data['P'], data['K'], weather_data['temperature'], weather_data['humidity'], data['ph'], weather_data['rainfall']]
        top3_crops = predict_crops(features)

        response = format_response(top3_crops)
        response_json = json.dumps({'recommended_crops': response}, ensure_ascii=False)
        return Response(response=response_json, status=200, content_type="application/json; charset=utf-8")

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/getAllCities', methods=['GET'])
def get_all_cities():
    city_names = list(city_coordinates_india.keys())
    response = Response(
        response=json.dumps(city_names, ensure_ascii=False),
        status=200,
        content_type="application/json; charset=utf-8"
    )
    return response

@app.route('/getAllMonths', methods=['GET'])
def get_all_months():
    month_names = list(month_dates.keys())
    response = Response(
        response=json.dumps(month_names, ensure_ascii=False),
        status=200,
        content_type="application/json; charset=utf-8"
    )
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)