# Yolo Cam Monitoring Application

## Overview

This application is designed to monitor cows in a barn using video processing and machine learning. It consists of a backend powered by Flask and YOLO (You Only Look Once) for object detection, and a frontend built with React and Chart.js for data visualization.

## Project Structure


## Setup backend 
Create an environment 
python -m venv venv {change the name if you want more personolized environment }
Activate Envionment 
.\venv\scripts\activate

install 
pip install ultralytics
pip install flask 
pip install flask-cors
pip install azure-cognitiveservices-vision-customvision

in backend folder run 
python app.py

## Setup frontend 
cd frontend /src 
in the src directory 
npm install 
 npm install react-chartjs-2 chart.js
npm install @mui/material @emotion/react @emotion/styled --force 

in src folder run 
npm start

## Usage

- The frontend captures frames from a local video and sends them to the backend for cow detection.
- The backend processes the frames using YOLO models and returns the count of standing and laying cows.
- The frontend displays the results in a dashboard with a pie chart and status messages.

## License

This project is licensed under the MIT License.