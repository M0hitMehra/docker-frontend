// Animation variants extracted from App.jsx
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const noteVariants = {
  hidden: { y: 50, opacity: 0, rotateX: 45 },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: { type: "spring", stiffness: 100 },
  },
  hover: {
    scale: 1.05,
    rotateY: 5,
    z: 50,
    transition: { type: "spring", stiffness: 400 },
  },
};

// Common animation variants for UI components
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideInVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
  exit: { x: "-100%" },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const notificationVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};
