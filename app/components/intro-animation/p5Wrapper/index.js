"use client";
import React, { useEffect, useRef } from "react";

const P5Wrapper = ({ sketch }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    import("p5").then((p5Module) => {
      const p5 = p5Module.default;
      const p5Instance = new p5(sketch, containerRef.current);
      return () => p5Instance.remove();
    });
  }, [sketch]);

  return <div ref={containerRef} className="w-full h-full"></div>;
};

export default P5Wrapper;
