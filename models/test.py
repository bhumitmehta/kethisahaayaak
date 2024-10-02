import requests

city_coordinates = {
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

url = "https://pro.openweathermap.org/data/2.5/forecast/climate?"

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

def get_coordinates(city_name):
    return city_coordinates.get(city_name, (None, None))

def get_month_dates(month_name):
    if month_name in month_dates:
        start_date, end_date = month_dates[month_name]
        start_date = f"2023-{start_date}"
        end_date = f"2023-{end_date}"
        return start_date, end_date
    else:
        return None, None

latitude, longitude = get_coordinates("Cairo")
start_date, end_date = get_month_dates("يناير")

params = {
    "latitude": latitude,
    "longitude": longitude,
    "start_date": start_date,
    "end_date": end_date,
    "hourly": "temperature_2m,relative_humidity_2m",
    "timezone": "Africa/Cairo"
}

response = requests.get(url, params=params)

if response.status_code == 200:
    data = response.json()

    temperature_data = data["hourly"]["temperature_2m"]
    humidity_data = data["hourly"]["relative_humidity_2m"]
    
    average_temperature = round(sum(temperature_data) / len(temperature_data), 2)
    average_humidity = round(sum(humidity_data) / len(humidity_data), 2)
    
    result = {
        "average_temperature": average_temperature,
        "average_humidity": average_humidity
    }
    print(result)

else:
    print(f"Failed to retrieve data: {response.status_code}")