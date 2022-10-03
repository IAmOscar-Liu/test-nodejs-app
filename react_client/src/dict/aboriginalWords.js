const words = Array.from(
  new Set([
    "原住民",
    "百步蛇",
    "拼板舟",
    "船眼",
    "泰雅族",
    "太魯閣族",
    "賽德克族",
    "阿美族",
    "排灣族",
    "布農族",
    "卑南族",
    "賽夏族",
    "邵族",
    "噶瑪蘭族",
    "撒奇萊雅族",
    "鄒族",
    "卡那卡那富族",
    "拉阿魯哇族",
    "魯凱族",
    "達悟族",
    "雅美族",
    "沙阿魯阿族",
    "少數民族",
    "土著",
    "平埔族",
    "達魯瑪克部落",
    "部落",
    "馬太鞍部落",
    "除瘟祭",
    "傳統祭儀",
    "祖靈祭",
    "新年祭",
    "矮靈祭",
    "射耳祭",
    "戰祭",
    "貝神祭",
    "五年祭",
    "小米收穫祭",
    "海祭",
    "豐年祭",
    "猴祭",
    "大獵祭",
    "飛魚祭",
    "新船下水祭",
    "夜祭",
    "開墾祭",
    "播種祭",
    "除草祭",
    "收割祭",
    "收藏祭",
    "開倉嘗新祭",
    "獵頭祭",
    "米貢祭",
    "祖靈",
    "祈天祭",
    "特富野社祭儀",
    "報訊曲",
    "邵織紋",
    "追逐白鹿",
    "會所制度",
    "報訊鈴",
    "歌謠",
    "飲酒歡樂歌",
    "祭歌",
    "sizung",
    "石雕柱",
    "木雕圖紋",
    "香蕉絲織布",
    "禮裙",
    "巴斯達隘",
    "賜福成長",
    "日字紋",
    "歌舞",
    "舞片流蘇裙",
    "大禮冠盤帽",
    "巴拉告",
    "特富野社",
    "歷史頌",
    "家屋",
    "杵音",
    "長木杵",
    "主柱",
    "貓頭鷹",
    "測柱",
    "傳說",
    "馬蘭",
    "鞦韆"
  ])
);

export const aboriginalWords = [
  ...words.sort((a, b) => b.length - a.length)
].join("|");