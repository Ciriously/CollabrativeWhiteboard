import React, { useRef } from "react";

const Board = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{ backgroundColor: "white" }}
    />
  );
};

export default Board;
