// export const handleSpecialChar = (items) => {
//   const arrays = [
//     ...items.matchAll(/[%、，、，-；:,\/\\\?\.\+\[\]\(\){}「」˚℃]/gi)
//   ];
//   for (let i = arrays.length - 1; i >= 0; i--) {
//     items = [
//       items.slice(0, arrays[i].index),
//       `.`,
//       items.slice(arrays[i].index + arrays[i][0].length)
//     ].join("");
//   }
//   // console.log(items);
//   return items;
// };

// .‧·
/*
  "@",
  "、",
  "，",
  "、",
  "-",
  "；",
  ":",
  ",",
  "\\\\",
  "\\/",
  "\\?",
  "\\.",
  "\\+",
  "\\[",
  "\\]",
  "\\(",
  "\\)",
  "{",
  "}",
  "「",
  "」"
*/

export const handleSpecialChar = (items) => {
  const arrays = [...items.matchAll(/[^θ&＆a-z0-9\u4E00-\u9FFF]/gi)];
  for (let i = arrays.length - 1; i >= 0; i--) {
    const replaceReg =
      // arrays[i][0] === "/" ||
      // arrays[i][0] === "(" ||
      // arrays[i][0] === ")" ||
      // arrays[i][0] === "，" ||
      // arrays[i][0] === "、"
      ["/", "(", ")", "[", "]", ".", "?", "+"].includes(arrays[i][0])
        ? `\\${arrays[i][0]}`
        : [
            "@",
            "、",
            "，",
            "、",
            "‧",
            "·",
            "-",
            "；",
            ":",
            ",",
            "{",
            "}",
            "「",
            "」"
          ].includes(arrays[i][0])
        ? arrays[i][0]
        : `[\\u4E00-\\u9FFF]`;
    items = [
      items.slice(0, arrays[i].index),
      replaceReg,
      items.slice(arrays[i].index + arrays[i][0].length)
    ].join("");
  }
  // console.log(items);
  return items;
};
