import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import { Brush, defaultBrush, eraserBrush } from "./DrawingMaterials";
import { Container, Grid } from "@mui/material";
import DrawingContainer from "./DrawingContainer";

interface MyBoard {
  brushColor: string;
  brushSize: number;
}

const Board: React.FC<MyBoard> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket, setSocket] = useState(null);
  const [currentBrush, setCurrentBrush] = useState<Brush>(defaultBrush);
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    console.log(newSocket, "Connected to socket");
    setSocket(newSocket);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("canvasImage", (data) => {
        const image = new Image();
        image.src = data;

        const canvas = canvasRef.current;
        const ctx = canvas ? canvas.getContext("2d") : null;

        if (ctx) {
          image.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);
          };
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const startDrawing = (e: { offsetX: number; offsetY: number }) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const draw = (e: { offsetX: number; offsetY: number }) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      const ctx = canvas ? canvas.getContext("2d") : null;

      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = currentBrush.color;
        ctx.lineWidth = currentBrush.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }

      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const endDrawing = () => {
      const canvas = canvasRef.current;
      const dataURL = canvas ? canvas.toDataURL() : "";

      if (socket) {
        socket.emit("canvasImage", dataURL);
        console.log("Drawing ended");
      }
      isDrawing = false;
    };

    const canvas: HTMLCanvasElement | null = canvasRef.current;
    const ctx = canvas ? canvas.getContext("2d") : null;

    if (ctx) {
      ctx.strokeStyle = currentBrush.color;
      ctx.lineWidth = currentBrush.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    canvas?.addEventListener("mousedown", startDrawing);
    canvas?.addEventListener("mousemove", draw);
    canvas?.addEventListener("mouseup", endDrawing);
    canvas?.addEventListener("mouseout", endDrawing);

    return () => {
      canvas?.removeEventListener("mousedown", startDrawing);
      canvas?.removeEventListener("mousemove", draw);
      canvas?.removeEventListener("mouseup", endDrawing);
      canvas?.removeEventListener("mouseout", endDrawing);
    };
  }, [currentBrush, socket]);

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
    const ctx = canvas ? canvas.getContext("2d") : null;

    setCurrentBrush(eraserBrush);

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (socket) {
      socket.emit("canvasImage", canvas?.toDataURL());
    }
  };

  const handleColorChange = (newColor: string) => {
    setCurrentBrush((prevBrush) => ({ ...prevBrush, color: newColor }));
  };

  const handleSizeChange = (newSize: number) => {
    setCurrentBrush((prevBrush) => ({ ...prevBrush, size: newSize }));
  };

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <canvas
            ref={canvasRef}
            width={windowSize[0] > 1000 ? 800 : 400}
            height={windowSize[1] > 600 ? 600 : 300}
            style={{ backgroundColor: "white" }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DrawingContainer
            currentBrush={currentBrush}
            handleColorChange={(newColor) =>
              setCurrentBrush((prevBrush) => ({
                ...prevBrush,
                color: newColor,
              }))
            }
            handleSizeChange={(newSize) =>
              setCurrentBrush((prevBrush) => ({ ...prevBrush, size: newSize }))
            }
            handleEraserClick={handleEraserClick}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Board;
