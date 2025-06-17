import { motion } from "motion/react"; // Fixed import statement
import dynamic from "next/dynamic";

const P5Wrapper = dynamic(() => import("../p5Wrapper"), {
  ssr: false,
});

export default function WaveBackground() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 -z-10"
    >
      <P5Wrapper sketch={sketch} />
    </motion.div>
  );
}

// Optimized P5 sketch function
const sketch = (p) => {
  // Improved constants
  const size = 20;
  const scl = 100;
  const speed = 0.01;
  const noiseScale = 0.001;
  const maxBoxes = 600; // Reduced from 800
  const boxLifespan = 70;
  const waveSpeed = 0.01;
  const boxCreationThreshold = 8;
  const boxCreationInterval = 4; // Increased from 3 to reduce creation frequency

  // Variables
  const boxes = [];
  const boxPool = []; // Object pool for reusing Box instances
  let timeOffset = 0;
  let lastX = 0;
  let lastY = 0;
  let mouseVelocityX = 0;
  let mouseVelocityY = 0;
  let frameCounter = 0;
  let lastProcessTime = 0; // For throttling

  // Grid for spatial partitioning (faster neighbor finding)
  const grid = {};
  const gridSize = 60;

  // Add to spatial grid
  function addToGrid(box) {
    const cellX = Math.floor(box.x / gridSize);
    const cellY = Math.floor(box.y / gridSize);
    const cellKey = `${cellX},${cellY}`;

    if (!grid[cellKey]) {
      grid[cellKey] = [];
    }
    grid[cellKey].push(box);
  }

  // Remove from spatial grid
  function removeFromGrid(box) {
    const cellX = Math.floor(box.x / gridSize);
    const cellY = Math.floor(box.y / gridSize);
    const cellKey = `${cellX},${cellY}`;

    if (grid[cellKey]) {
      const index = grid[cellKey].indexOf(box);
      if (index !== -1) {
        grid[cellKey].splice(index, 1);
      }
    }
  }

  // Get or create box (object pooling)
  function getBox(x, y, z) {
    if (boxPool.length > 0) {
      const box = boxPool.pop();
      box.reset(x, y, z);
      return box;
    }
    return new Box(x, y, z);
  }

  // Class for individual boxes
  class Box {
    constructor(x, y, z) {
      this.reset(x, y, z);
    }

    reset(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.angle = p.random(p.TWO_PI);
      this.scl = scl;
      this.speed = speed;
      this.noiseOffsetX = p.random(1000);
      this.noiseOffsetY = p.random(1000);
      this.randomFactor = p.random(0.7, 1.3);
      this.lifespan = boxLifespan;
      this.alpha = 160;
      this.initialOffset = p.random(20, 50);
      this.created = false;
      this.neighbors = [];
      this.neighborUpdateFrame = 0;
      this.minBrightness = p.random(50, 100);
      this.maxBrightness = p.random(180, 255);

      // Add to spatial grid
      addToGrid(this);

      return this;
    }

    update() {
      this.lifespan--;

      if (!this.created) {
        this.initialOffset *= 0.8;
        if (this.initialOffset < 0.5) {
          this.created = true;
        }
      }

      if (this.lifespan < 80) {
        this.alpha = p.map(this.lifespan, 0, 80, 0, 160);
      }

      // Find neighbors only occasionally to improve performance
      if (
        this.neighbors.length === 0 ||
        frameCounter - this.neighborUpdateFrame > 20
      ) {
        this.findNeighborsEfficient();
        this.neighborUpdateFrame = frameCounter;
      }

      // Optimized noise calculation (less frequent)
      const noiseVal = p.noise(
        this.x * noiseScale + this.noiseOffsetX + timeOffset,
        this.y * noiseScale + this.noiseOffsetY + timeOffset
      );

      this.z = p.map(noiseVal, 0, 1, -this.scl, this.scl) * this.randomFactor;
      this.z += p.sin(this.angle + timeOffset * 2) * (this.scl / 3);

      // Influence from neighbors (only if we have some)
      if (this.neighbors.length > 0) {
        let avgNeighborZ = 0;
        let activeNeighbors = 0;

        for (let i = 0; i < this.neighbors.length; i++) {
          const neighbor = this.neighbors[i];
          if (!neighbor.isDead()) {
            avgNeighborZ += neighbor.z;
            activeNeighbors++;
          }
        }

        if (activeNeighbors > 0) {
          avgNeighborZ /= activeNeighbors;
          this.z = p.lerp(this.z, (this.z + avgNeighborZ) / 2, 0.1);
        }
      }

      this.angle += this.speed * this.randomFactor;
    }

    findNeighborsEfficient() {
      this.neighbors = [];
      const cellX = Math.floor(this.x / gridSize);
      const cellY = Math.floor(this.y / gridSize);

      // Check nearby cells only
      for (let x = cellX - 1; x <= cellX + 1; x++) {
        for (let y = cellY - 1; y <= cellY + 1; y++) {
          const cellKey = `${x},${y}`;
          if (grid[cellKey]) {
            for (let i = 0; i < grid[cellKey].length; i++) {
              const box = grid[cellKey][i];
              if (box !== this) {
                const d = p.dist(this.x, this.y, box.x, box.y);
                if (d < 60) {
                  this.neighbors.push(box);
                  if (this.neighbors.length >= 5) return;
                }
              }
            }
          }
        }
      }
    }

    display() {
      // Simple frustum culling for performance
      if (
        this.x < -p.width / 2 - 50 ||
        this.x > p.width / 2 + 50 ||
        this.y < -p.height / 2 - 50 ||
        this.y > p.height / 2 + 50
      ) {
        return; // Skip drawing off-screen boxes
      }

      p.push();

      if (!this.created) {
        p.translate(this.x, this.y, this.z - this.initialOffset);
      } else {
        p.translate(this.x, this.y, this.z);
      }

      p.noFill();

      // Calculate stroke color (optimized to reduce calculations)
      const strokeBrightness = p.map(
        p.sin(this.angle + this.z / 20),
        -1,
        1,
        this.minBrightness,
        this.maxBrightness
      );

      p.stroke(
        strokeBrightness,
        strokeBrightness,
        strokeBrightness,
        this.alpha
      );
      p.strokeWeight(p.map(this.z, -scl, scl, 0.8, 2.5));

      // Use simpler geometry for better performance
      p.box(size * 0.9);
      p.pop();
    }

    isDead() {
      return this.lifespan <= 0;
    }
  }

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.frameRate(60);
    p.smooth();

    lastX = p.mouseX;
    lastY = p.mouseY;
  };

  p.draw = function () {
    p.background(0);
    frameCounter++;

    // Skip frames for performance if too many boxes
    const heavyLoad = boxes.length > 300;
    if (heavyLoad && frameCounter % 2 !== 0) {
      // Only update on every other frame when under heavy load
      timeOffset += waveSpeed;
      return;
    }

    p.ambientLight(100);
    p.directionalLight(255, 255, 255, 0, -1, -1);

    // Calculate mouse velocity (throttled)
    const currentTime = p.millis();
    if (currentTime - lastProcessTime > 16) {
      // ~60fps throttling
      mouseVelocityX = p.mouseX - lastX;
      mouseVelocityY = p.mouseY - lastY;
      lastX = p.mouseX;
      lastY = p.mouseY;
      lastProcessTime = currentTime;
    }

    // Only create boxes on some frames to reduce load
    if (
      (p.mouseIsPressed ||
        p.abs(mouseVelocityX) > 0.5 ||
        p.abs(mouseVelocityY) > 0.5) &&
      frameCounter % boxCreationInterval === 0
    ) {
      const x = p.mouseX - p.width / 2;
      const y = p.mouseY - p.height / 2;
      const mouseSpeed = p.abs(mouseVelocityX) + p.abs(mouseVelocityY);

      if (mouseSpeed > boxCreationThreshold) {
        let newBoxes = p.floor(
          p.map(mouseSpeed, boxCreationThreshold, 40, 1, 2)
        );
        if (p.random() < 0.7) newBoxes = 1;

        for (let i = 0; i < newBoxes; i++) {
          if (boxes.length < maxBoxes) {
            const scatter = p.map(mouseSpeed, 0, 40, 5, 30);
            const boxX = x + p.random(-scatter, scatter);
            const boxY = y + p.random(-scatter, scatter);
            boxes.push(getBox(boxX, boxY, 0));
          }
        }
      }
    }

    // Update all boxes
    for (let i = 0; i < boxes.length; i++) {
      boxes[i].update();
    }

    // Remove and display boxes
    for (let i = boxes.length - 1; i >= 0; i--) {
      boxes[i].display();

      if (boxes[i].isDead()) {
        removeFromGrid(boxes[i]); // Remove from spatial grid
        boxPool.push(boxes[i]); // Return to object pool
        boxes.splice(i, 1);
      }
    }

    // Create ripple less frequently
    if (p.random() < 0.003 && boxes.length > 10) {
      createRipple();
    }

    timeOffset += waveSpeed;
  };

  function createRipple() {
    if (boxes.length === 0) return;

    const centerIndex = p.floor(p.random(boxes.length));
    const centerBox = boxes[centerIndex];

    // Optimize by only checking nearby boxes using the grid
    const cellX = Math.floor(centerBox.x / gridSize);
    const cellY = Math.floor(centerBox.y / gridSize);

    for (let x = cellX - 2; x <= cellX + 2; x++) {
      for (let y = cellY - 2; y <= cellY + 2; y++) {
        const cellKey = `${x},${y}`;
        if (grid[cellKey]) {
          for (const box of grid[cellKey]) {
            const d = p.dist(centerBox.x, centerBox.y, box.x, box.y);
            if (d < 150) {
              const influence = p.map(d, 0, 150, 50, 0);
              box.z += influence;
            }
          }
        }
      }
    }
  }

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.camera(0, 0, p.height * 0.8, 0, 0, 0, 0, 1, 0);
  };

  // Throttle mouse events for better performance
  let lastMouseEventTime = 0;

  p.mouseMoved = function () {
    const now = p.millis();
    if (now - lastMouseEventTime < 32) {
      // ~30fps for mouse events
      return false;
    }
    lastMouseEventTime = now;

    const speed = p.abs(p.mouseX - p.pmouseX) + p.abs(p.mouseY - p.pmouseY);

    if (
      speed > boxCreationThreshold &&
      frameCounter % boxCreationInterval === 0
    ) {
      const x = p.mouseX - p.width / 2;
      const y = p.mouseY - p.height / 2;

      if (boxes.length < maxBoxes) {
        boxes.push(getBox(x + p.random(-10, 10), y + p.random(-10, 10), 0));
      }
    }
    return false;
  };

  p.mouseDragged = function () {
    const now = p.millis();
    if (
      now - lastMouseEventTime < 32 ||
      frameCounter % boxCreationInterval !== 0
    ) {
      return false;
    }
    lastMouseEventTime = now;

    const x = p.mouseX - p.width / 2;
    const y = p.mouseY - p.height / 2;
    const dragSpeed = p.abs(p.mouseX - p.pmouseX) + p.abs(p.mouseY - p.pmouseY);

    if (dragSpeed > boxCreationThreshold) {
      const numBoxes = Math.min(2, Math.floor(dragSpeed / 15));

      for (let i = 0; i < numBoxes; i++) {
        if (boxes.length < maxBoxes) {
          const pathX = x + p.random(-8, 8);
          const pathY = y + p.random(-8, 8);
          boxes.push(getBox(pathX, pathY, 0));
        }
      }
    }
    return false;
  };
};
