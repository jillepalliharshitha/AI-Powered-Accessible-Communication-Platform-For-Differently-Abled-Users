import React, { useState, useRef, useEffect } from 'react';
import './ResizableVideo.css';

const ResizableVideo = ({ videoRef, isDetecting, children }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      const deltaY = e.clientY - startYRef.current;
      
      const newWidth = startWidthRef.current + deltaX;
      const newHeight = startHeightRef.current + deltaY;
      
      if (containerRef.current) {
        containerRef.current.style.width = `${Math.max(300, newWidth)}px`;
        containerRef.current.style.height = `${Math.max(200, newHeight)}px`;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'auto';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'nwse-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'auto';
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    
    if (containerRef.current) {
      startWidthRef.current = containerRef.current.offsetWidth;
      startHeightRef.current = containerRef.current.offsetHeight;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      ref={containerRef}
      className={`resizable-video ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {children}
      
      {/* Resize Handle */}
      <div className="resize-handle" onMouseDown={handleMouseDown}>
        <div className="resize-icon">⤡</div>
      </div>
      
      {/* Fullscreen Toggle */}
      <button className="fullscreen-toggle" onClick={toggleFullscreen}>
        {isFullscreen ? '✕' : '⛶'}
      </button>
    </div>
  );
};

export default ResizableVideo;
