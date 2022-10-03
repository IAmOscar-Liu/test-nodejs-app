const allColors = [
  [210, 105, 30],
  [109, 207, 107],
  [156, 157, 48],
  [131, 196, 5],
  [175, 112, 112],
  [77, 157, 79],
  [134, 134, 220],
  [51, 214, 214],
  [225, 66, 220],
  [171, 185, 46],
  [229, 134, 53],
  [152, 212, 42],
  [206, 197, 197],
  [210, 130, 178],
  [118, 185, 173],
  [198, 237, 80],
  [171, 160, 160],
  [192, 186, 74],
  [237, 193, 155],
  [112, 218, 125],
  [125, 214, 202],
  [85, 170, 231],
  [173, 71, 71],
  [199, 34, 229],
  [145, 159, 67],
  [21, 173, 82],
  [87, 149, 173],
  [218, 195, 204],
  [5, 183, 18],
  [107, 107, 188]
];

export const pickColor = (index) => {
  if (allColors[index]) {
    return `rgb(${allColors[index][0]}, ${allColors[index][1]}, ${allColors[index][2]})`;
    //return `rgba(${allColors[index][0]}, ${allColors[index][1]}, ${allColors[index][2]}, .7)`;
  }
  // 0.2126*R + 0.7152*G + 0.0722*B
  let R, G, B;
  do {
    R = Math.random();
    G = Math.random();
    B = Math.random();
  } while (0.2126 * R + 0.7152 * G + 0.0722 * B < 0.5);
  return `rgb(${Math.floor(R * 255)}, ${Math.floor(G * 255)}, ${Math.floor(
    B * 255
  )})`;
  // return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
  //   Math.random() * 255
  // )}, ${Math.floor(Math.random() * 255)})`;
};
