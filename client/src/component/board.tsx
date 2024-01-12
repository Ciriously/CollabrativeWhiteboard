import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

interface MyBoard {
  brushColor: string;
  brushSize: number;
}

const Board: React.FC<MyBoard> = (props) => {
  const { brushColor, brushSize } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    console.log(newSocket, "Connected to socket");
    setSocket(newSocket);
  }, []);

  useEffect(() => {
    if (socket) {
      // Event listener for receiving canvas data from the socket
      socket.on("canvasImage", (data) => {
        // Create an image object from the data URL
        const image = new Image();
        image.src = data;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        // Draw the image onto the canvas
        image.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
          ctx.drawImage(image, 0, 0);
        };
      });
    }
  }, [socket]);

  // Function to start drawing
  useEffect(() => {
    // Variables to store drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    const startDrawing = (e: { offsetX: number; offsetY: number }) => {
      isDrawing = true;

      console.log(`drawing started`, brushColor, brushSize);
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    // Function to draw
    const draw = (e: { offsetX: number; offsetY: number }) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }

      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    // Function to end drawing
    const endDrawing = () => {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL(); // Get the data URL of the canvas content

      // Send the dataURL or image data to the socket
      // console.log('drawing ended')
      if (socket) {
        socket.emit("canvasImage", dataURL);
        console.log("drawing ended");
      }
      isDrawing = false;
    };

    const canvas: HTMLCanvasElement | null = canvasRef.current;
    const ctx = canvasRef.current?.getContext("2d");

    // Set initial drawing styles
    if (ctx) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    // Event listeners for drawing
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("mouseout", endDrawing);

    return () => {
      // Clean up event listeners when component unmounts
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDrawing);
      canvas.removeEventListener("mouseout", endDrawing);
    };
  }, [brushColor, brushSize, socket]);

  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const handleEraserClick = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Emit a signal to inform other users about the eraser action
    if (socket) {
      socket.emit("canvasImage", canvas.toDataURL());
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={windowSize[0] > 1000 ? 800 : 400}
        height={windowSize[1] > 600 ? 600 : 300}
        style={{ backgroundColor: "white" }}
      />
      <button onClick={handleEraserClick}>Eraser</button>
    </>
  );
};

export default Board;
