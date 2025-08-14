// Color utility functions extracted from App.jsx
export const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "#ff4757";
    case "medium":
      return "#ffa502";
    case "low":
      return "#26de81";
    default:
      return "#778ca3";
  }
};

// Generate random gradient background
export const generateRandomGradient = (colors) => {
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  return `linear-gradient(45deg, ${color1}, ${color2})`;
};

// Convert hex to rgba
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Get theme-appropriate background
export const getThemeBackground = (darkMode) => {
  return darkMode
    ? "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 100%)"
    : "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 100%)";
};

// Get theme-appropriate text color
export const getThemeTextColor = (darkMode) => {
  return darkMode ? "#ffffff" : "#333333";
};
