import { numOfUnit, units } from "./allUnitWords";

const referWords_1 = Array.from(
  new Set([
    ...numOfUnit.reduce((acc, cur) => {
      units.forEach((u) => acc.push(cur + u));
      return acc;
    }, []),
    "至少",
    "些",
    "等",
    "端",
    "一", // 「一」是一定要的*/
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
    "兩",
    "各",
    "個"
  ])
);

const referWords_2 = Array.from(
  new Set([
    "包括有",
    "包含有",
    "具有",
    "俱有",
    "包含",
    "包括",
    "之", // 「之」是一定要的
    "的" // 「的」是一定要的
  ])
);

export const limitedChar = Array.from(
  new Set([
    "各",
    "些",
    "有",
    "數",
    ...units
    // ...num.map((nn) => "第" + nn)
    // units = ["個", "種", "端", "筆", "組", "對"];
  ])
);

export const getReferWords_1 = () =>
  [...referWords_1].sort((a, b) => b.length - a.length).join("|");

export const getReferWords_2 = () =>
  [...referWords_2].sort((a, b) => b.length - a.length).join("|");

export const getLimitedChar = () => limitedChar.join("");

export const symetricPrefix = () =>
  Array.from(
    new Set([
      "上",
      "下",
      "左",
      "右",
      "前",
      "後",
      "頭",
      "尾",
      "正",
      "負",
      "開",
      "關",
      "高",
      "低",
      "內",
      "外",
      "中"
    ])
  ).join("");
