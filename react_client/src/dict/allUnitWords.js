export const units = ["個", "種", "端", "筆", "組", "對"];

export const num = ["一", "二", "兩", "三", "四", "五", "六", "七", "八", "九"];

export const numOfUnit = Array.from(
  new Set([
    ...num.map((n) => "至少" + n),
    ...num.map((n) => "任意" + n),
    ...num.map((n) => "任" + n),
    ...num.map((n) => "另外" + n),
    ...num.map((n) => "另" + n),
    "複數",
    "若干",
    "多數",
    "很多",
    "每一",
    "多",
    "數",
    "各",
    "一",
    "二",
    "兩",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九"
  ])
);

const words = Array.from(
  new Set([
    ...numOfUnit.reduce((acc, cur) => {
      units.forEach((u) => acc.push(cur + u));
      return acc;
    }, []),
    ...numOfUnit.filter((a) => a.length >= 2),
    "相對應的",
    "對應的",
    "相對的",
    "相對應之",
    "對應之",
    "相對之",
    "相對應",
    "些許",
    "對應",
    "相對",
    "至少",
    "些",
    ...units.map((un) => "些" + un),
    "等",
    "任",
    "另",
    "各",
    ...num,
    ...units
    // "個", "種", "端", "筆", "組", "對"
  ])
);

export const allUnitWords = () =>
  [...words].sort((a, b) => b.length - a.length).join("|");

export const allFirstTimeSeparateWord = () =>
  [...words]
    .filter((w) => w !== "端" && w !== "等")
    .filter((w) => ![...num, ...units].filter((ww) => ww !== "一").includes(w))
    .sort((a, b) => b.length - a.length)
    .join("|");
