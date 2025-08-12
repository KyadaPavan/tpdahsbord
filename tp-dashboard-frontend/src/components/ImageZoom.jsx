import React, { useRef, useState } from "react";

const ImageZoom = ({ src, alt, className = "", style = {} }) => {
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    let newScale = scale + (e.deltaY < 0 ? 0.2 : -0.2);
    newScale = Math.max(1, Math.min(newScale, 5));
    setScale(newScale);
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - start.x, y: e.clientY - start.y });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 5));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 1));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleZoomIn}
          className="px-3 py-1 bg-[#3b158a] text-white rounded hover:bg-[#2d1069]"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="px-3 py-1 bg-[#3b158a] text-white rounded hover:bg-[#2d1069]"
        >
          -
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1 bg-gray-300 text-[#3b158a] rounded hover:bg-gray-400"
        >
          Reset
        </button>
      </div>
      <div
        className="overflow-hidden border rounded bg-gray-50"
        style={{
          width: "100%",
          maxWidth: 1100,
          maxHeight: 800,
          cursor: dragging ? "grabbing" : scale > 1 ? "grab" : "default",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={className}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${
              position.y / scale
            }px)`,
            transition: dragging ? "none" : "transform 0.2s",
            maxWidth: "100%",
            maxHeight: "800px",
            userSelect: "none",
            pointerEvents: "all",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default ImageZoom;
