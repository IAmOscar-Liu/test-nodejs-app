export const isMainElementValid = (
  claim,
  utilityModelTitle,
  applicationNum
) => {
  const mainElement = claim.mainElement.split(/[\\(\\)]/)[0];

  const mainElementMatch = mainElement.match(/(方法|程序|流程|步驟)$/);

  if (applicationNum[3] !== "1" && mainElementMatch) {
    // "一種好方法".match(/(方法|結構)$/)

    const contentMatch = claim.content.match(/(方法|程序|流程|步驟)/);

    claim.errors.push({
      message: `標的名稱「${mainElement}」係為${mainElementMatch[0]}，不符新型標的之規定。`,
      errorContent: mainElementMatch[0],
      start: contentMatch.index,
      end: contentMatch.index + contentMatch[0].length,
      mainElement,
      utilityModelTitle
    });
  }

  /*
  if (claim.num === 2) {
    console.log("mainElement", mainElement);
    console.log("utilityModelTitle", utilityModelTitle);
    debugger;
  }
*/

  // 1. 主要元件名稱完全包含在新型名稱裡 或 新型名稱完全包含在主要元件名稱裡
  if (
    utilityModelTitle.includes(mainElement) ||
    mainElement.includes(utilityModelTitle)
  ) {
    return;
  }

  let numOfMatchChar = 0;
  const titleCharArr = utilityModelTitle.split("");
  for (let i = 0; i < mainElement.length; i++) {
    if (titleCharArr.includes(mainElement[i])) {
      numOfMatchChar++;
      titleCharArr.splice(titleCharArr.indexOf(mainElement[i]), 1);
    }
  }

  if (
    (mainElement.length <= 3 && numOfMatchChar < mainElement.length) ||
    (mainElement.length > 3 && numOfMatchChar / mainElement.length < 0.5)
  ) {
    // 1. 若主要元件名稱字數長度小於3, 所有的字都要出現在新型名稱裡面
    // 2. 若主要元件名稱字數長度大於3, 50%以上的字要出現在新型名稱裡面
    claim.errors.push({
      message: `標的名稱「${mainElement}」與新型名稱「${utilityModelTitle}」用語不相符。`,
      start: -90,
      end: -89,
      mainElement,
      utilityModelTitle
    });
  }
};
