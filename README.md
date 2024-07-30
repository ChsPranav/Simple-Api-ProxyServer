API Proxy Server
Overview
This API Proxy Server is built using Node.js and Express.js. It forwards requests to the Weatherstack API, caches responses, enforces rate limits, and logs details of each request. The server includes features such as rate limiting, caching, basic authentication, and detailed logging.

Features
Proxy Endpoint: Forwards requests to the Weatherstack API.
Rate Limiting: Limits requests to 5 per minute per IP address.
Caching: Caches successful API responses for 5 minutes.
Authentication: Basic token-based authentication.
Logging: Logs each request with timestamp, IP address, method, URL, status code, response time, content length, and rate limit status.
Error Handling: Handles errors from external API calls gracefully.
Setup Instructions
Prerequisites
Node.js (v14.x or later)
npm (v6.x or later)
Installation
Clone the repository:


git clone <repository-url>
cd api-proxy-server
Install dependencies:

npm install
Create a .env file:


in env file text
PORT=3000
RATE_LIMIT=5
CACHE_DURATION=300
AUTH_TOKEN=your_auth_token
WEATHERSTACK_API_KEY=your_weatherstack_api_key
Running the Server

Start the server with the following command:
node index.js
The server will run on the port specified in the .env file (default is 3000).

Usage
Request Format
To make a request to the proxy server, use the following format:

URL: http://localhost:3000/proxy?query=<location>
Method: GET
Headers:
Authorization: Bearer your_auth_token
Example Requests
Successful Request:


curl -H "Authorization: Bearer your_auth_token" "http://localhost:3000/proxy?query=New Delhi"
Exceeding Rate Limit:


for i in {1..6}; do curl -H "Authorization: Bearer your_auth_token" "http://localhost:3000/proxy?query=New Delhi"; done
Unauthorized Request:


curl "http://localhost:3000/proxy?query=New Delhi"
Expected Responses
Successful Request:

Status: 200 OK
Body: JSON response from the Weatherstack API.
Example response:
{
    "request": {
        "type": "City",
        "query": "New Delhi, India",
        "language": "en",
        "unit": "m"
    },
    "location": {
        "name": "New Delhi",
        "country": "India",
        "region": "Delhi",
        "lat": "28.600",
        "lon": "77.200",
        "timezone_id": "Asia/Kolkata",
        "localtime": "2024-07-29 15:30",
        "localtime_epoch": 1627561200,
        "utc_offset": "5.50"
    },
    "current": {
        "observation_time": "10:30 AM",
        "temperature": 34,
        "weather_code": 113,
        "weather_icons": [
            "https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png"
        ],
        "weather_descriptions": [
            "Sunny"
        ],
        "wind_speed": 7,
        "wind_degree": 270,
        "wind_dir": "W",
        "pressure": 1007,
        "precip": 0,
        "humidity": 40,
        "cloudcover": 0,
        "feelslike": 36,
        "uv_index": 7,
        "visibility": 10,
        "is_day": "yes"
    }
}
Rate Limit Exceeded:

Status: 429 Too Many Requests
Body:
json
Copy code
{
    "error": "Too many requests. Please try again later."
}
Unauthorized Request:

Status: 401 Unauthorized
{
    "error": "Unauthorized"
}
Error from External API:

Status: 500 Internal Server Error (or other relevant status codes based on the error)
{
    "error": "Error fetching from external API"
}
Implementation Details
Proxy Endpoint
The proxy endpoint /proxy forwards requests to the Weatherstack API. The query parameter in the request specifies the location for which weather data is requested. The response from the Weatherstack API is cached for 5 minutes to improve performance and reduce the number of requests to the external API.

Rate Limiting
The rate limiting middleware is implemented using express-rate-limit to limit requests to 5 per minute per IP address. When the limit is exceeded, a 429 status code is returned with an appropriate error message.

Caching
Caching is implemented using node-cache. Successful API responses are cached for 5 minutes (configurable via environment variables). Cached responses are served if available, reducing the number of requests to the external API.

Authentication
Basic token-based authentication is implemented. The server expects an Authorization header with a Bearer token. If the token is missing or invalid, a 401 status code is returned.

Logging
Logging is implemented using morgan. Each request is logged with details including timestamp, IP address, method, URL, status code, response time, content length, and rate limit status. Custom Morgan token rateLimitStatus is used to log the rate limit status.

Error Handling
Errors from external API calls are handled gracefully. The server distinguishes between different types of errors (e.g., network errors, response errors) and returns appropriate status codes and messages.

Example Log Output
Here’s an example of what the logs will look like:


2024-07-29T15:30:00.000Z ::1 GET /proxy?query=New%20Delhi 200 50ms - within limit
2024-07-29T15:31:00.000Z ::1 GET /proxy?query=New%20Delhi 429 1ms - exceeded
Weatherstack API Documentation
The Weatherstack API provides real-time weather information. Below is a brief overview of the API, and for detailed documentation, please visit Weatherstack API Documentation.

Endpoints
Current Weather Data: Get real-time weather information for a specific location.
Endpoint: http://api.weatherstack.com/current
Parameters:
access_key: Your API access key.
query: Location for which you want the weather information.

Example Request
curl "http://api.weatherstack.com/current?access_key=your_api_key&query=New Delhi"
Example Response
{
    "request": {
        "type": "City",
        "query": "New Delhi, India",
        "language": "en",
        "unit": "m"
    },
    "location": {
        "name": "New Delhi",
        "country": "India",
        "region": "Delhi",
        "lat": "28.600",
        "lon": "77.200",
        "timezone_id": "Asia/Kolkata",
        "localtime": "2024-07-29 15:30",
        "localtime_epoch": 1627561200,
        "utc_offset": "5.50"
    },
    "current": {
        "observation_time": "10:30 AM",
        "temperature": 34,
        "weather_code": 113,
        "weather_icons": [
            "https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png"
        ],
        "weather_descriptions": [
            "Sunny"
        ],
        "wind_speed": 7,
        "wind_degree": 270,
        "wind_dir": "W",
        "pressure": 1007,
        "precip": 0,
        "humidity": 40,
        "cloudcover": 0,
        "feelslike": 36,
        "uv_index": 7,
        "visibility": 10,
        "is_day": "yes"
    }
}

For more details and advanced usage, please refer to the Weatherstack API Documentation.

Conclusion
This API Proxy Server is a robust and efficient solution for forwarding requests to the Weatherstack API while enforcing rate limits, caching responses, and handling errors gracefully. The implementation includes detailed logging and basic authentication to ensure security and traceability. The rate limit and cache duration are configurable via environment variables, providing flexibility for different use cases.

If you have any questions or need further assistance, please feel free to reach out.
