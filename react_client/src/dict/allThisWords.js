const words = [
  "前述之",
  "所述之",
  "上述之",
  // "其中之",
  "前述的",
  "所述的",
  "上述的",
  "前述該",
  "所述該",
  "上述該",
  "其中該",
  // "其中的",
  "所述",
  "前述",
  "所述",
  "上述",
  // "其中",
  "該"
];

export const allThisWords = () =>
  [...words].sort((a, b) => b.length - a.length).join("|");
