const words = Array.from(
  new Set([
    "以允許",
    "以用來",
    "相對應",
    "相對於",
    "對應於",
    "對應到",
    "作用在",
    "做用在",
    "作用於",
    "做用於",
    "可用以",
    "可對應",
    "係用以",
    "可用來",
    "係用來",
    "可用於",
    "係用於",
    "上述",
    "前述",
    "對於",
    "對應",
    "用以",
    "用於",
    "用來",
    "可以",
    "不行",
    "無法",
    "包括",
    "包含",
    "一種",
    "多種",
    "若干",
    "具有",
    "延伸",
    "而且",
    "並且",
    "以及",
    "大於",
    "小於",
    "等於",
    "共有",
    "置於",
    "位於",
    "至少",
    "最少",
    "至多",
    "最多",
    "第一",
    "第二",
    "第三",
    "第四",
    "第五",
    "第六",
    "第七",
    "第八",
    "第九",
    "第十",
    "是否",
    "較佳",
    "另外",
    "任意",
    "任一",
    "另",
    "任",
    "又",
    "有",
    "或",
    "並",
    "若",
    "且",
    "係",
    "是",
    "之",
    "的",
    "和",
    "與",
    "及",
    "且",
    "該", // 「該」是一定要的
    "一" // 「一」也很重要
  ])
);

export const allSeperatedWords = () =>
  [...words].sort((a, b) => b.length - a.length).join("|");