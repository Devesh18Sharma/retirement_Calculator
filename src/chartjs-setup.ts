// src/chartjs-setup.ts
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
  } from "chart.js";
  
  // Register the Chart.js components
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
  
  // Optionally set global defaults (fonts, colors, etc.)
  ChartJS.defaults.font.family = "Libre Franklin, Arial, sans-serif";
  ChartJS.defaults.color = "#293A60";
  
  export default ChartJS;
  