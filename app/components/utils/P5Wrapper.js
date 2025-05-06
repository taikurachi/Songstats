// components/P5Wrapper.js
"use client";
import React, { useEffect, useRef } from "react";

const P5Wrapper = ({ sketch }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Import p5 on client-side only
    import("p5").then((p5Module) => {
      const p5 = p5Module.default;

      // Create a new p5 instance with the sketch
      const p5Instance = new p5(sketch, containerRef.current);

      // Cleanup function to remove the sketch when the component unmounts
      return () => {
        p5Instance.remove();
      };
    });
  }, [sketch]);

  return <div ref={containerRef} className="w-full h-full"></div>;
};

export default P5Wrapper;
