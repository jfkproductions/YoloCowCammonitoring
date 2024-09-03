import React, { useEffect, useRef, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Container, Grid, Paper, Typography, Box, AppBar, Toolbar, LinearProgress, List, ListItem, ListItemText } from '@mui/material';

// Register the required components for ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

const LocalVideoProcessor = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [totalCows, setTotalCows] = useState(0);
  const [standingCows, setStandingCows] = useState(0);
  const [layingCows, setLayingCows] = useState(0);
  const [statusMessages, setStatusMessages] = useState([]);
  const [progress, setProgress] = useState(0);

  const addStatusMessage = (message) => {
    setStatusMessages(prevMessages => [...prevMessages, message]);
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const handleLoadedData = () => {
      addStatusMessage("Local video loaded, starting frame capture...");

      const intervalId = setInterval(() => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          addStatusMessage("Capturing frame from local video...");

          // Capture the frame from the video
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert the canvas content to a Blob
          canvas.toBlob((blob) => {
            if (blob) {
              addStatusMessage("Blob generated successfully: " + blob);
              setProgress(50);

              const formData = new FormData();
              formData.append('image', blob, 'frame.jpg');

              addStatusMessage("Sending image to backend...");
              setProgress(75);

              fetch('http://127.0.0.1:5000/detect_cows', {
                method: 'POST',
                body: formData,
                headers: {
                  'Accept': 'application/json',
                },
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
              })
              .then(data => {
                addStatusMessage("Received cow counts: " + JSON.stringify(data));
                setTotalCows(data.total_cows);
                setStandingCows(data.standing_cows);
                setLayingCows(data.laying_cows);
                setProgress(100);
              })
              .catch(error => {
                addStatusMessage("Error occurred during the POST request: " + error);
              });
            } else {
              addStatusMessage("Blob generation failed. No image was captured.");
            }
          }, 'image/jpeg');
        } else {
          addStatusMessage("Video not ready. Skipping frame capture...");
        }
      }, 45000); // Capture an image every 30 minutes

      return () => clearInterval(intervalId);
    };

    if (video) {
      video.addEventListener('loadeddata', handleLoadedData);
    } else {
      addStatusMessage("Video element is not available.");
    }

    return () => {
      if (video) {
        video.removeEventListener('loadeddata', handleLoadedData);
      }
    };
  }, []);

  // Data for the pie chart
  const data = {
    labels: ['Standing Cows', 'Laying Cows'],
    datasets: [{
      data: [standingCows, layingCows],
      backgroundColor: ['#36A2EB', '#FF6384'],
      hoverBackgroundColor: ['#36A2EB', '#FF6384']
    }]
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cow Monitoring Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <video
                ref={videoRef}
                width="100%"
                controls
                autoPlay
                muted
                loop
              >
                <source src="/Video/barn.mkv" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Processing Status</Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, mb: 2 }} />
                <List>
                  {statusMessages.map((message, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={message} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Cow Statistics
              </Typography>
              <Typography variant="body1">Total Cows: {totalCows}</Typography>
              <Typography variant="body1">Standing Cows: {standingCows}</Typography>
              <Typography variant="body1">Laying Cows: {layingCows}</Typography>
              <Box sx={{ mt: 3 }}>
                <Pie data={data} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LocalVideoProcessor;
