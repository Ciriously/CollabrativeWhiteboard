// DrawingContainer.tsx

import React from "react";
import { Paper, Slider, Typography } from "@mui/material";
import { Brush } from "./DrawingMaterials";

interface DrawingContainerProps {
  currentBrush: Brush;
  handleColorChange: (newColor: string) => void;
  handleSizeChange: (newSize: number) => void;
  handleEraserClick: () => void;
}

const DrawingContainer: React.FC<DrawingContainerProps> = ({
  currentBrush,
  handleColorChange,
  handleSizeChange,
  handleEraserClick,
}) => {
  return (
    <Paper
      elevation={3}
      style={{
        padding: "16px",
        border: "1px solid lightblue",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Select Color:
      </Typography>
      <input
        type="color"
        id="colorPicker"
        value={currentBrush.color}
        onChange={(e) => handleColorChange(e.target.value)}
      />

      <Typography variant="h6" gutterBottom>
        Select Size:
      </Typography>
      <Slider
        id="sizeSlider"
        min={1}
        max={50}
        value={currentBrush.size}
        onChange={(_, value) => handleSizeChange(value as number)}
      />
      <Typography>{currentBrush.size}</Typography>

      <button onClick={handleEraserClick}>Reset</button>
    </Paper>
  );
};

export default DrawingContainer;
