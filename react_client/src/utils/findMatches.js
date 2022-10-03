import { aboriginalWords } from "../dict/aboriginalWords";
import { symetricPrefix } from "../dict/allReferWords";
import { concatWordSeparater } from "../dict/concatWordSeparater";
import {
  allFigBetweenMatch,
  figWithCommaBetween,
  figWithThisCommaBetween,
  figWithRangeBetween,
  figWithThisRangeBetween
} from "../dict/figReg";
import { allKeyBetweenMatch, allSymbolChar } from "../dict/keyRegs";
import { getKeyInRange } from "./otherUtils";

export const findMatches = (
  applicationNum,
  paragraph,
  regExp,
  concatRegExp,
  concatSymRegExp,
  regExpWithWrongChar,
  descriptionOfElementMap,
  figureOfDrawingsMap,
  allDrawings
) => {
  // 符號說明的元件開頭是英文 -> 優先處理
  const elementsStartWithAlphabet = regExp
    .split("|")
    .filter((el) => RegExp(`^[${allSymbolChar}']+`, "i").test(el))
    .map((el) =>
      el.slice(el.match(RegExp(`^[${allSymbolChar}']+`, "i"))[0].length)
    )
    .filter((el) => typeof el === "string" && el.length > 0);

  const elementsStartWithAlphabetOrigin = regExp
    .split("|")
    .filter((el) => RegExp(`^[${allSymbolChar}']+`, "i").test(el))
    .filter((el) => typeof el === "string" && el.length > 0)
    .join("|");

  // console.log(elementsStartWithAlphabet);
  // debugger;

  // 0. 找圖式簡單說明明
  let figMatches = [];
  let allMatchesFromFig = allFigBetweenMatch(paragraph)
    .filter(
      (match) =>
        !/^[@θ%度˚℃]/.test(paragraph.slice(match.index + match[0].length))
    )
    .filter((match) => {
      if (elementsStartWithAlphabet.length === 0) {
        return true;
      }
      return !RegExp(`^(${elementsStartWithAlphabet.join("|")})`).test(
        paragraph.slice(match.index + match[0].length)
      );
    });

  /*
  if (paragraph.startsWith("進一步參考圖1")) {
    console.log(
      allFigBetweenMatch(paragraph).filter(
        (match) =>
          !/^[@θ%度˚℃]/.test(paragraph.slice(match.index + match[0].length))
      )
    );
    console.log("elementsStartWithAlphabet", elementsStartWithAlphabet);
    console.log("allMatchesFromFig", allMatchesFromFig);
    debugger;
  }
  */

  /*if (paragraph.startsWith("據此，本創作之擺飾品於製作實施時，請一併參閱")) {
    const allCommaMatch = [
      ...paragraph.matchAll(figWithCommaBetween),
      ...paragraph.matchAll(figWithThisCommaBetween)
    ];
    const allRangeMatch = [
      ...paragraph.matchAll(figWithRangeBetween),
      ...paragraph.matchAll(figWithThisRangeBetween)
    ];

    const allMatches = [...allCommaMatch, ...allRangeMatch].sort(
      (a, b) => a.index - b.index
    );
    console.log("allMatches: ", allMatches);
    debugger;

    const finalMatches = [];

    while (allMatches.length > 0) {
      const tmp = allMatches.shift();

      if (
        tmp.index >
        (finalMatches[finalMatches.length - 1]?.index ?? -1) +
          (finalMatches[finalMatches.length - 1]?.[0].length ?? 0)
      ) {
        finalMatches.push(tmp);
        continue;
      }

      if (
        tmp.index === (finalMatches[finalMatches.length - 1]?.index ?? -1) &&
        tmp[0].length > (finalMatches[finalMatches.length - 1]?.[0].length ?? 0)
      ) {
        finalMatches[finalMatches.length - 1] = tmp;
      }
    }
    console.log("final matches: ", finalMatches);
    debugger;
  }*/

  allMatchesFromFig.forEach((match) => {
    let keys = match[0]
      .replaceAll(/第|圖/g, "")
      .replaceAll(/[()]/g, "")
      .split(/[、，,或與和以及跟]/)
      .filter((e) => e !== "")
      .map((k) => k.trim());

    // if (/.+[~-].+/.test(keys[0])) {
    //   keys = getKeyInRange(keys[0]);
    // }
    if (keys.some((curKey) => /.+[-~～到至].+/.test(curKey))) {
      keys = keys.reduce((accKeys, curKey) => {
        if (/.+[-~～到至].+/.test(curKey)) {
          return [...accKeys, ...getKeyInRange(curKey, true)];
        }
        return [...accKeys, curKey];
      }, []);
    }

    match.type = "figure";
    match.keys = keys.map((k) => "圖" + k);

    figMatches.push(match);
    // console.log("we fine one");
    // console.log(match);
    //   debugger;
  });

  // 1. 先找特別元件名稱 -> 符號 e.g. 第一、第二元件
  let concatMatches = [];
  if (concatRegExp !== "") {
    const _concatRegExp = RegExp(
      `(第[一二三四五六七八九十]([${concatWordSeparater}]第?[一二三四五六七八九十])+(${concatRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*)`,
      "ig"
    );
    concatMatches = [...concatMatches, ...paragraph.matchAll(_concatRegExp)];
    // Test
    // if (concatMatches.length > 0) {
    //   console.log("concatMatches");
    //   console.log(concatMatches);
    //   debugger;
    // }
  }
  if (concatSymRegExp !== "") {
    const _concatSymRegExp = RegExp(
      `([${symetricPrefix()}]([${concatWordSeparater}][${symetricPrefix()}])+(${concatSymRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*)`,
      "ig"
    );
    concatMatches = [...concatMatches, ...paragraph.matchAll(_concatSymRegExp)];
  }
  if (concatMatches.length > 0) {
    concatMatches = concatMatches
      .filter(
        (match) =>
          !figMatches.some(
            (mt) =>
              !(
                match.index + match[0].length <= mt.index ||
                match.index >= mt.index + mt[0].length
              )
          )
      )
      .sort((a, b) => a.index - b.index)
      .map((match) => {
        match.type = "concatMatch";
        // console.log(match);
        // debugger;
        if (
          match[5] &&
          RegExp(`[${allSymbolChar}']+$`, "i").test(match[5]) &&
          (/^[@θ%度˚℃]/.test(paragraph.slice(match.index + match[0].length)) ||
            (elementsStartWithAlphabet.length > 0 &&
              RegExp(`^(${elementsStartWithAlphabet.join("|")})`).test(
                paragraph.slice(match.index + match[0].length)
              )))
        ) {
          match[0] = match[0].split(/[、,]/).slice(0, -1).join("、");
          match[5] = match[5].split(/[、,]/).slice(0, -1).join("、");
          match[6] = match[6].split(/[、,]/).slice(0, -1).join("、");
        }
        return match;
      });
  }

  /**
   * Test
   */
  // console.log(_regExp);
  // debugger;

  // 2. 先找元件名稱 -> 符號
  let matches = [];
  for (let i = 0; i <= 1; i++) {
    if (i === 1 && elementsStartWithAlphabetOrigin === "") {
      break;
    }
    const _regExp = RegExp(
      //`(${regExp})\\(?([${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*)`,
      `(${
        i === 0 ? regExp : elementsStartWithAlphabetOrigin
      })\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*)`,
      `ig`
    );
    // console.log(_regExp);
    // debugger;

    let matchesThisRound = [...paragraph.matchAll(_regExp)]
      .filter(
        (match) =>
          !figMatches.some(
            (mt) =>
              !(
                match.index + match[0].length <= mt.index ||
                match.index >= mt.index + mt[0].length
              )
          )
      )
      .filter(
        (match) =>
          !matches.some(
            (mt) =>
              !(
                match.index + match[0].length <= mt.index ||
                match.index >= mt.index + mt[0].length
              )
          )
      )
      .filter(
        (match) =>
          !concatMatches.some(
            (mt) =>
              !(
                match.index + match[0].length <= mt.index ||
                match.index >= mt.index + mt[0].length
              )
          )
      )
      .map((match) => {
        if (
          match[3] &&
          RegExp(`[${allSymbolChar}']+$`, "i").test(match[3]) &&
          (/^[@θ%度˚℃]/.test(paragraph.slice(match.index + match[0].length)) ||
            (elementsStartWithAlphabet.length > 0 &&
              RegExp(`^(${elementsStartWithAlphabet.join("|")})`).test(
                paragraph.slice(match.index + match[0].length)
              )))
        ) {
          // console.log("change match");
          // console.log(match);
          // debugger;
          match[0] = match[0].split(/[、,]/).slice(0, -1).join("、");
          match[3] = match[3].split(/[、,]/).slice(0, -1).join("、");
          match[4] = match[4].split(/[、,]/).slice(0, -1).join("、");
          // debugger;
          return match;
        }
        return match;
      })
      .map((match) => {
        if (
          /[()]$/.test(match[0]) &&
          !RegExp(`[${allSymbolChar}-~']+\\)$`, "i").test(match[0])
        ) {
          match[0] = match[0].slice(0, match[0].length - 1);
          return match;
        }
        return match;
      });

    // Test
    // if (
    //   /^如圖1至圖10所示，圖中揭示出，為一種手腳並用升降移位輔助裝置/.test(
    //     paragraph
    //   )
    // ) {
    //   console.log(paragraph);
    //   console.log(
    //     [...paragraph.matchAll(_regExp)]
    //       .filter(
    //         (match) =>
    //           !matches.some(
    //             (mt) =>
    //               !(
    //                 match.index + match[0].length <= mt.index ||
    //                 match.index >= mt.index + mt[0].length
    //               )
    //           )
    //       )
    //       .filter(
    //         (match) =>
    //           !concatMatches.some(
    //             (mt) =>
    //               !(
    //                 match.index + match[0].length <= mt.index ||
    //                 match.index >= mt.index + mt[0].length
    //               )
    //           )
    //       )
    //       .map((match) => {
    //         if (
    //           match[3] &&
    //           /[${allSymbolChar}']+$/i.test(match[3]) &&
    //           (/^[@θ%度˚℃]/.test(
    //             paragraph.slice(match.index + match[0].length)
    //           ) ||
    //             RegExp(`^(${elementsStartWithAlphabet.join("|")})`).test(
    //               paragraph.slice(match.index + match[0].length)
    //             ))
    //         ) {
    //           console.log("change match");
    //           console.log("origin match", match);
    //           console.log(
    //             `paragraph.slice(match.index + match[0].length)`,
    //             paragraph.slice(match.index + match[0].length)
    //           );
    //           console.log(
    //             `final if`,
    //             match[3] &&
    //               /[${allSymbolChar}']+$/i.test(match[3]) &&
    //               (/^[@θ%度˚℃]/.test(
    //                 paragraph.slice(match.index + match[0].length)
    //               ) ||
    //                 (elementsStartWithAlphabet.length > 0 &&
    //                   RegExp(`^(${elementsStartWithAlphabet.join("|")})`).test(
    //                     paragraph.slice(match.index + match[0].length)
    //                   )))
    //           );

    //           debugger;
    //           match[0] = match[0].split(/[、,]/).slice(0, -1).join("、");
    //           match[3] = match[3].split(/[、,]/).slice(0, -1).join("、");
    //           match[4] = match[4].split(/[、,]/).slice(0, -1).join("、");
    //           // debugger;
    //           return match;
    //         }
    //         return match;
    //       })
    //   );
    //   debugger;
    // }

    matches = [...matchesThisRound, ...matches].sort(
      (a, b) => a.index - b.index
    );
  }

  matches = matches.map((match, matchIdx) => {
    if (
      RegExp(`^(以及|和|與|及|或|到|至)\\(?[${allSymbolChar}']+\\)?`, "i").test(
        paragraph.slice(match.index + match[0].length)
      )
    ) {
      const extraKeys = paragraph
        .slice(match.index + match[0].length)
        .match(
          RegExp(
            `^(以及|和|與|及|或)(\\(?[${allSymbolChar}']+\\)?)(@|θ|%|\\\\|\\?|\\.|\\+|\\[|\\]|\\(|\\)|{|}|「|」|˚|℃|的|皆|個|年|月|日|度|[0-9]|[a-z]|[A-Z])?`,
            "i"
          )
        );
      // .match(
      //   /^(以及|和|與|及|或)(\(?[0-9a-zθ']+\)?)(@|θ|%|\\|\?|\.|\+|\[|\]|\(|\)|{|}|「|」|˚|℃|的|皆|個|年|月|日|度|[0-9]|[a-z]|[A-Z])?/i
      // );
      const extraRange = paragraph
        .slice(match.index + match[0].length)
        .match(
          RegExp(
            `^(至|到)(\\(?[${allSymbolChar}']+\\)?)(@|θ|%|\\\\|\\?|\\.|\\+|\\[|\\]|\\(|\\)|{|}|「|」|˚|℃|的|皆|個|年|月|日|度|[0-9]|[a-z]|[A-Z])?`,
            "i"
          )
        );

      if ((extraKeys || extraRange)[3]) {
        return match;
      }

      if (
        matches[matchIdx + 1] &&
        match.index + match[0].length + (extraKeys || extraRange)[0].length >=
          matches[matchIdx + 1].index
      ) {
        return match;
      }
      if (
        figMatches.find(
          (mt) =>
            !(
              match.index +
                match[0].length +
                (extraKeys || extraRange)[0].length <=
                mt.index || match.index >= mt.index + mt[0].length
            )
        )
      ) {
        return match;
      }
      if (
        concatMatches.find(
          (mt) =>
            !(
              match.index +
                match[0].length +
                (extraKeys || extraRange)[0].length <=
                mt.index || match.index >= mt.index + mt[0].length
            )
        )
      ) {
        return match;
      }

      if (extraKeys) {
        match.extraKeys = extraKeys[2];
      } else {
        match.extraRange = extraRange[2];
      }

      match[0] = match[0] + (extraKeys || extraRange)[0];
      // console.log("it ok to add new key");
      // console.log("we got sth here");
      // console.log(match);
      // // console.log(extraKeys);
      // debugger;
      return match;
    }
    return match;
  });

  // console.log("my matches");
  // console.log(matches);

  // console.log(matches);
  // if (/^在較佳實施例的量子裝置.量子電腦.之中/.test(paragraph)) {
  //   console.log("1. my matches");
  //   console.log(_regExp);
  //   console.log(paragraph);
  //   console.log(matches);
  //   debugger;
  // }

  // 3. 最後找有錯字的元件名稱
  const _regExpWithWrongChar = RegExp(
    //`(${regExpWithWrongChar})\\(?([${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*)`,
    `(${regExpWithWrongChar})\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*)`,
    `ig`
  );
  // console.log(_regExpWithWrongChar);
  // debugger;

  const matchesWithWrongChar = [...paragraph.matchAll(_regExpWithWrongChar)];
  let wrongCharMatches = [];
  matchesWithWrongChar.forEach((match) => {
    if (
      figMatches.find(
        (mt) =>
          !(
            match.index + match[0].length <= mt.index ||
            match.index >= mt.index + mt[0].length
          )
      )
    ) {
      return;
    }
    if (
      concatMatches.find(
        (mt) =>
          !(
            match.index + match[0].length <= mt.index ||
            match.index >= mt.index + mt[0].length
          )
      )
    ) {
      return;
    }
    if (
      matches.find(
        (mt) =>
          !(
            match.index + match[0].length <= mt.index ||
            match.index >= mt.index + mt[0].length
          )
      )
    ) {
      return;
    }
    wrongCharMatches.push(match);
  });

  wrongCharMatches = wrongCharMatches
    .map((match) => {
      if (
        match[3] &&
        RegExp(`[${allSymbolChar}']+$`, "i").test(match[3]) &&
        (/^[@θ%度˚℃]/.test(paragraph.slice(match.index + match[0].length)) ||
          (elementsStartWithAlphabet.length > 0 &&
            RegExp(`^(${elementsStartWithAlphabet.join("|")})`).test(
              paragraph.slice(match.index + match[0].length)
            )))
      ) {
        // console.log(match);
        match[0] = match[0].split(/[、,]/).slice(0, -1).join("、");
        match[3] = match[3].split(/[、,]/).slice(0, -1).join("、");
        match[4] = match[4].split(/[、,]/).slice(0, -1).join("、");
        // debugger;
        return match;
      }
      return match;
    })
    .map((match, matchIdx) => {
      if (
        RegExp(
          `^(以及|和|與|及|或|到|至)\\(?[${allSymbolChar}']+\\)?`,
          "i"
        ).test(paragraph.slice(match.index + match[0].length))
      ) {
        const extraKeys = paragraph
          .slice(match.index + match[0].length)
          .match(
            RegExp(
              `(以及|和|與|及|或)(\\(?[${allSymbolChar}']+\\)?)(@|θ|%|\\\\|\\?|\\.|\\+|\\[|\\]|\\(|\\)|{|}|「|」|˚|℃|的|皆|個|年|月|日|度|[0-9]|[a-z]|[A-Z])?`,
              "i"
            )
          );
        // .match(
        //   /^(以及|和|與|及|或)(\(?[0-9a-zθ']+\)?)(@|θ|%|\\|\?|\.|\+|\[|\]|\(|\)|{|}|「|」|˚|℃|的|皆|個|年|月|日|度|[0-9]|[a-z]|[A-Z])?/i
        // );

        const extraRange = paragraph
          .slice(match.index + match[0].length)
          .match(
            RegExp(
              `^(至|到)(\\(?[${allSymbolChar}']+\\)?)(@|θ|%|\\\\|\\?|\\.|\\+|\\[|\\]|\\(|\\)|{|}|「|」|˚|℃|的|皆|個|年|月|日|度|[0-9]|[a-z]|[A-Z])?`,
              "i"
            )
          );
        // .match(
        //   /^(至|到)(\(?[0-9a-zθ']+\)?)(@|θ|%|\\|\?|\.|\+|\[|\]|\(|\)|{|}|「|」|˚|℃|的|皆|個|年|月|日|度|[0-9]|[a-z]|[A-Z])?/i
        // );

        if ((extraKeys || extraRange)[3]) {
          return match;
        }

        const nextMatchIdx =
          (matches.find((mm) => mm.index > match.index) &&
            matches.find((mm) => mm.index > match.index).index) ||
          1000000;
        const nextWrongMatchIdx =
          (wrongCharMatches[matchIdx + 1] &&
            wrongCharMatches[matchIdx + 1].index) ||
          1000000;
        const nextIdx =
          nextMatchIdx < nextWrongMatchIdx ? nextMatchIdx : nextWrongMatchIdx;
        if (
          match.index + match[0].length + (extraKeys || extraRange)[0].length >=
          nextIdx
        ) {
          return match;
        }
        if (
          concatMatches.find(
            (mt) =>
              !(
                match.index +
                  match[0].length +
                  (extraKeys || extraRange)[0].length <=
                  mt.index || match.index >= mt.index + mt[0].length
              )
          )
        ) {
          return match;
        }

        if (extraKeys) {
          match.extraKeys = extraKeys[2];
        } else {
          match.extraRange = extraRange[2];
        }

        match[0] = match[0] + (extraKeys || extraRange)[0];
        return match;
      }
      return match;
    });

  // Test
  // if (/^本發明中，所謂「產生蒸氣」意指藉由以下方法/.test(paragraph)) {
  //   console.log("wrongCharMatches");
  //   console.log(wrongCharMatches);
  //   debugger;
  // }

  // 4. 再找符號 -> 元件名稱
  let symbolMatches = [];
  let allMatchesFromSymbol = allKeyBetweenMatch(paragraph)
    .filter(
      (match) =>
        !/^[@θ%度˚℃]/.test(paragraph.slice(match.index + match[0].length))
    )
    .filter((match) => {
      if (elementsStartWithAlphabet.length === 0) {
        return true;
      }
      return !RegExp(`^(${elementsStartWithAlphabet.join("|")})`).test(
        paragraph.slice(match.index + match[0].length)
      );
    })
    .filter(
      (match) =>
        !figMatches.some(
          (mt) =>
            !(
              match.index + match[0].length <= mt.index ||
              match.index >= mt.index + mt[0].length
            )
        )
    )
    .filter(
      (match) =>
        !concatMatches.some(
          (mt) =>
            !(
              match.index + match[0].length <= mt.index ||
              match.index >= mt.index + mt[0].length
            )
        )
    )
    .filter(
      (match) =>
        !matches.some(
          (mt) =>
            !(
              match.index + match[0].length <= mt.index ||
              match.index >= mt.index + mt[0].length
            )
        )
    );

  // Test
  // if (
  //   /^該殼體1，其上具有一頭部殼體11、一握把殼體12及一頭部上蓋13。該頭部殼體11/.test(
  //     paragraph
  //   )
  // ) {
  //   console.log("check here");
  //   console.log(allKeyBetweenMatch(paragraph));
  //   console.log(allMatchesFromSymbol);
  //   debugger;
  // }

  allMatchesFromSymbol.forEach((match) => {
    let keys = match[0]
      .replaceAll(/[()]/g, "")
      .split(/[、,]/)
      .filter((e) => e !== "");
    // if (/.+[~-].+/.test(keys[0])) {
    //   keys = getKeyInRange(keys[0]);
    // }
    if (keys.some((curKey) => /.+[~-].+/.test(curKey))) {
      keys = keys.reduce((accKeys, curKey) => {
        if (/.+[-~～].+/.test(curKey)) {
          return [...accKeys, ...getKeyInRange(curKey)];
        }
        return [...accKeys, curKey];
      }, []);
    }

    const correctPreElements = keys.map((key) => {
      const matchedPreElements = [
        ...((descriptionOfElementMap[key] &&
          descriptionOfElementMap[key].values) ||
          []),
        ...((figureOfDrawingsMap[key] && figureOfDrawingsMap[key].values) || [])
      ];

      if (matchedPreElements.length > 0) {
        return matchedPreElements;
      }
      return getDuplicateValues(key, descriptionOfElementMap);
    });

    if (
      correctPreElements.some((v) => v === null) ||
      !correctPreElements.every(
        (v) => JSON.stringify(v) === JSON.stringify(correctPreElements[0])
      )
    ) {
      return;
    }

    let prevElement = correctPreElements[0]
      .filter((e) => e !== "")
      .map((mm) => {
        if (match.index - mm.length >= 0) {
          // Test
          // console.log("correctPreElements", mm);
          // console.log(
          //   "testPreElements",
          //   paragraph.slice(match.index - mm.length, match.index)
          // );
          // debugger;
          return findClosestElement(
            paragraph.slice(match.index - mm.length, match.index),
            mm
          );
        }
        return null;
      })
      .filter((e) => e !== null && !/[^\u4E00-\u9FFF]/.test(e.testElement))
      .sort((a, b) => b.matchedRatio - a.matchedRatio)[0];

    // console.log("keys: ", keys);
    // console.log("correctPreElement: ", correctPreElements[0]);
    // console.log("prevElement: ", prevElement);
    // debugger;

    if (
      !prevElement ||
      figMatches.some(
        (mt) =>
          !(
            match.index + match[0].length <= mt.index ||
            match.index - prevElement.testElement.length >=
              mt.index + mt[0].length
          )
      ) ||
      concatMatches.some(
        (mt) =>
          !(
            match.index + match[0].length <= mt.index ||
            match.index - prevElement.testElement.length >=
              mt.index + mt[0].length
          )
      ) ||
      matches.some(
        (mt) =>
          !(
            match.index + match[0].length <= mt.index ||
            match.index - prevElement.testElement.length >=
              mt.index + mt[0].length
          )
      ) ||
      wrongCharMatches.some(
        (mt) =>
          !(
            match.index + match[0].length <= mt.index ||
            match.index - prevElement.testElement.length >=
              mt.index + mt[0].length
          )
      )
    ) {
      return;
    }

    match[0] = prevElement.testElement + match[0];
    match.index -= prevElement.testElement.length;
    match.type = "symbol";
    match.keys = keys;
    match.prevElement = prevElement.testElement;
    match.potentialElement = prevElement.realElement;

    symbolMatches.push(match);
    // console.log("we fine one");
    // console.log(match);
    //   debugger;
  });

  // console.log(regMatchesKey);
  // debugger;
  // const regSymbol = RegExp(
  //   `(((${regMatchesKey.slice(
  //     0,
  //     regMatchesKey.length - 1
  //   )})+)(([、,](${regMatchesKey.slice(0, regMatchesKey.length - 1)})+)*))`,
  //   "ig"
  // );

  // // console.log(regSymbol);
  // //console.log(`(${regExpWithWrongChar.slice(0, regExpWithWrongChar.length-1)})$`);

  // const matchesBySymbol = [...paragraph.matchAll(regSymbol)];
  // const symbolReg = `(${regExpWithWrongChar})$`;

  // // console.log(symbolReg);
  // // debugger;

  // const hasCharBefore = /(@|、|，|、|，|-|；|:|,|\\|\?|\.|\+|\[|\]|\(|\)|{|}|「|」|第|圖|例|約|的|皆|和|或|及|至|[0-9]|[a-z]|[A-Z])$/;
  // const hasCharAfter = /^(@|θ|%|\\|\?|\.|\+|\[|\]|\(|\)|{|}|「|」|˚|℃|的|皆|個|年|月|日|度|[0-9]|[a-z]|[A-Z])/;

  // matchesBySymbol
  //   .filter(
  //     (symbolMatches) =>
  //       !hasCharBefore.test(paragraph.slice(0, symbolMatches.index)) &&
  //       !hasCharAfter.test(
  //         paragraph.slice(symbolMatches.index + symbolMatches[0].length)
  //       )
  //   )
  //   .forEach((symbolMatches) => {
  //     const previousElement = paragraph
  //       .slice(0, symbolMatches.index)
  //       .match(symbolReg);
  //     if (previousElement === null && symbolMatches[0].length < 2) {
  //       return;
  //     }
  //     symbolMatches.index = previousElement
  //       ? symbolMatches.index - previousElement[0].length
  //       : symbolMatches.index;
  //     symbolMatches.value = previousElement
  //       ? previousElement[0] + symbolMatches[0]
  //       : symbolMatches[0];
  //     if (
  //       matches.find(
  //         (mt) =>
  //           !(
  //             symbolMatches.index + symbolMatches.value.length <= mt.index ||
  //             symbolMatches.index >= mt.index + mt[0].length
  //           )
  //       )
  //     ) {
  //       return;
  //     }
  //     symbolMatches.keys = symbolMatches[0].split(/[、,]/).filter((k) => k !== "");
  //     symbolMatches.previousElement = previousElement ? previousElement[0] : null;
  //     symbolMatches.type = "symbol";

  //     // console.log(`get symbol: `);
  //     // console.log(symbolReg);
  //     // console.log(symbolMatches);
  //     // debugger;

  //     matches.push(symbolMatches);
  //   });

  // 5. 找「發明」此類用語
  let wrongWordMatches = [];
  if (applicationNum !== "" && applicationNum[3] === "2") {
    wrongWordMatches = [...paragraph.matchAll(/本發明|發明/g)]
      .filter(
        (match) =>
          !figMatches.some(
            (mt) =>
              !(
                match.index + match[0].length <= mt.index ||
                match.index >= mt.index + mt[0].length
              )
          )
      )
      .filter(
        (match) =>
          !concatMatches.some(
            (mt) =>
              !(
                match.index + match[0].length <= mt.index ||
                match.index >= mt.index + mt[0].length
              )
          )
      )
      .filter(
        (match) =>
          !matches.some(
            (mt) =>
              !(
                match.index + match[0].length <= mt.index ||
                match.index >= mt.index + mt[0].length
              )
          )
      )
      .filter(
        (match) =>
          !wrongCharMatches.some(
            (mt) =>
              !(
                match.index + match[0].length <= mt.index ||
                match.index >= mt.index + mt[0].length
              )
          )
      )
      .filter(
        (match) =>
          !symbolMatches.some(
            (mt) =>
              !(
                match.index + match[0].length <= mt.index ||
                match.index >= mt.index + mt[0].length
              )
          )
      )
      .map((match) => {
        match.type = "wrongWords";
        return match;
      });
  }

  // Test
  // if (wrongWordMatches.length > 0) {
  //   console.log(wrongWordMatches);
  //   debugger;
  // }

  // 6. 找原住民用語
  let aboriginalMatches = [...paragraph.matchAll(RegExp(aboriginalWords, "g"))]
    .filter(
      (match) =>
        !figMatches.some(
          (mt) =>
            !(
              match.index + match[0].length <= mt.index ||
              match.index >= mt.index + mt[0].length
            )
        )
    )
    .filter(
      (match) =>
        !concatMatches.some(
          (mt) =>
            !(
              match.index + match[0].length <= mt.index ||
              match.index >= mt.index + mt[0].length
            )
        )
    )
    .filter(
      (match) =>
        !matches.some(
          (mt) =>
            !(
              match.index + match[0].length <= mt.index ||
              match.index >= mt.index + mt[0].length
            )
        )
    )
    .filter(
      (match) =>
        !wrongCharMatches.some(
          (mt) =>
            !(
              match.index + match[0].length <= mt.index ||
              match.index >= mt.index + mt[0].length
            )
        )
    )
    .filter(
      (match) =>
        !symbolMatches.some(
          (mt) =>
            !(
              match.index + match[0].length <= mt.index ||
              match.index >= mt.index + mt[0].length
            )
        )
    )
    .filter(
      (match) =>
        !wrongWordMatches.some(
          (mt) =>
            !(
              match.index + match[0].length <= mt.index ||
              match.index >= mt.index + mt[0].length
            )
        )
    )
    .map((match) => {
      match.type = "aboriginalWords";
      return match;
    });

  matches = [
    ...figMatches,
    ...concatMatches,
    ...matches,
    ...wrongCharMatches,
    ...symbolMatches,
    ...wrongWordMatches,
    ...aboriginalMatches
  ].sort((a, b) => a.index - b.index);

  matches = matches.reduce((acc, cur) => {
    if (acc.find((m) => m.index === cur.index)) {
      return [...acc];
    }
    return [...acc, cur];
  }, []);

  //Test
  /*
  if (/^請參閱/.test(paragraph)) {
    console.log("all matches");
    console.log(matches);
    debugger;
  }
  */

  return matches;
};

const findClosestElement = (testElement, realElement) => {
  // console.log("try this");
  // console.log("testElement: ", testElement);
  // console.log("realElement: ", realElement);
  // debugger;

  let matchedCharCount = 0;
  for (let i = 0; i < testElement.length; i++) {
    if (realElement.includes(testElement[i])) {
      matchedCharCount++;
    }
  }
  return matchedCharCount / realElement.length >= 0.5
    ? {
        testElement,
        realElement,
        matchedRatio: matchedCharCount / realElement.length
      }
    : null;
};

const getDuplicateValues = (key, descriptionOfElementMap) => {
  const values = [];

  Object.keys(descriptionOfElementMap).forEach((k) => {
    if (k.startsWith(`${key}_duplicate`)) {
      values.push(...descriptionOfElementMap[k].values);
    }
  });

  return values.length === 0 ? null : values;
};
