const changeColor = (color: number[], decreaseAmount: number): number[] =>
  color.map((channel) => channel + decreaseAmount);

export default changeColor;
