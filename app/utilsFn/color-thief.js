// /*
//  * Color Thief v2.3.2
//  * by Lokesh Dhakar - http://www.lokeshdhakar.com
//  *
//  * Thanks
//  * -----
//  * Nick Rabinowitz - For creating quantize.js.
//  * John Schulz - For clean up and optimization. @JFSIII
//  * Nathan Spady - For adding drag and drop support to the demo page.
//  *
//  * License
//  * -------
//  * Copyright 2011, 2015, Lokesh Dhakar
//  * Released under the MIT license
//  * https://raw.githubusercontent.com/lokesh/color-thief/master/LICENSE
//  *
//  * @license
//  */

// class ColorThief {
//   constructor() {
//     this.palette = null;
//     this.color = null;
//   }

//   getColor(sourceImage, quality = 10) {
//     const palette = this.getPalette(sourceImage, 5, quality);
//     const dominantColor = palette[0];
//     return dominantColor;
//   }

//   getPalette(sourceImage, colorCount = 10, quality = 10) {
//     const image = this._loadImage(sourceImage);
//     const imageData = this._getImageData(image, quality);
//     const pixels = imageData.data;
//     const pixelCount = imageData.width * imageData.height;

//     // Store the RGB values in an array format suitable for quantize function
//     const pixelArray = [];
//     for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
//       offset = i * 4;
//       r = pixels[offset + 0];
//       g = pixels[offset + 1];
//       b = pixels[offset + 2];
//       a = pixels[offset + 3];

//       // If pixel is mostly opaque and not white
//       if (a >= 125) {
//         if (!(r > 250 && g > 250 && b > 250)) {
//           pixelArray.push([r, g, b]);
//         }
//       }
//     }

//     // Send array to quantize function which clusters values
//     // using median cut algorithm
//     const cmap = this._quantize(pixelArray, colorCount);
//     const palette = cmap ? cmap.palette() : null;

//     this.palette = palette;
//     return palette;
//   }

//   _loadImage(sourceImage) {
//     const image = new Image();
//     image.crossOrigin = "Anonymous";
//     image.src = sourceImage;
//     return image;
//   }

//   _getImageData(image, quality) {
//     const canvas = document.createElement("canvas");
//     const context = canvas.getContext("2d");
//     let width = image.width;
//     let height = image.height;

//     // Calculate new dimensions
//     const scale = Math.min(1, Math.sqrt((quality * 1000) / (width * height)));
//     width = Math.round(width * scale);
//     height = Math.round(height * scale);

//     canvas.width = width;
//     canvas.height = height;
//     context.drawImage(image, 0, 0, width, height);
//     return context.getImageData(0, 0, width, height);
//   }

//   _quantize(pixels, maxColors) {
//     // Create a histogram of the image
//     const histo = new Map();
//     for (let i = 0; i < pixels.length; i++) {
//       const rgb = pixels[i];
//       const key = rgb.join(",");
//       histo.set(key, (histo.get(key) || 0) + 1);
//     }

//     // Create a priority queue of color boxes
//     const boxes = [
//       {
//         colors: Array.from(histo.keys()).map((key) =>
//           key.split(",").map(Number)
//         ),
//         count: Array.from(histo.values()),
//         total: pixels.length,
//       },
//     ];

//     // Split boxes until we have enough
//     while (boxes.length < maxColors) {
//       const box = boxes.reduce((a, b) => (a.total > b.total ? a : b));
//       const splitBox = this._splitBox(box);
//       if (!splitBox) break;
//       boxes.push(splitBox);
//     }

//     // Calculate the average color for each box
//     return boxes.map((box) => {
//       const total = box.count.reduce((a, b) => a + b, 0);
//       const avg = box.colors
//         .reduce(
//           (acc, color, i) => {
//             return acc.map((val, j) => val + color[j] * box.count[i]);
//           },
//           [0, 0, 0]
//         )
//         .map((val) => Math.round(val / total));
//       return avg;
//     });
//   }

//   _splitBox(box) {
//     if (box.colors.length <= 1) return null;

//     // Find the channel with the greatest range
//     const ranges = box.colors.reduce((acc, color) => {
//       return acc.map((range, i) => {
//         return {
//           min: Math.min(range.min, color[i]),
//           max: Math.max(range.max, color[i]),
//         };
//       });
//     }, Array(3).fill({ min: 255, max: 0 }));

//     const channel = ranges.reduce((a, b, i) => {
//       return b.max - b.min > ranges[a].max - ranges[a].min ? i : a;
//     }, 0);

//     // Sort colors by the selected channel
//     const sorted = box.colors
//       .map((color, i) => ({ color, count: box.count[i] }))
//       .sort((a, b) => a.color[channel] - b.color[channel]);

//     // Split at the median
//     const median = Math.floor(sorted.length / 2);
//     const left = {
//       colors: sorted.slice(0, median).map((item) => item.color),
//       count: sorted.slice(0, median).map((item) => item.count),
//       total: sorted.slice(0, median).reduce((sum, item) => sum + item.count, 0),
//     };
//     const right = {
//       colors: sorted.slice(median).map((item) => item.color),
//       count: sorted.slice(median).map((item) => item.count),
//       total: sorted.slice(median).reduce((sum, item) => sum + item.count, 0),
//     };

//     return right;
//   }
// }

// export default ColorThief;
