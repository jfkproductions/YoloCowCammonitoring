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