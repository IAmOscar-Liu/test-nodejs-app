import { stringToUnicode } from "./stringToUnicode";
import { handleSpecialChar } from "./handleSpecialChar";
import {
  checkItemInModeForInvention,
  checkPreviousClaimContent,
  checkWrongElementInModeForInvention,
} from "./checkItemInModeForInvention";
import { allSeperatedWords } from "../dict/allSeperatedWords";
import { allFirstTimeSeparateWord, allUnitWords } from "../dict/allUnitWords";
import { allThisWords } from "../dict/allThisWords";
import { allIgnoreThisItems } from "../dict/allIgnoreThisItems";
import { getKeyInRange, getMapValues, isKeyInReserve } from "./otherUtils";
import {
  limitedChar,
  getLimitedChar,
  symetricPrefix,
} from "../dict/allReferWords";
import { allIgnoreMiddleWords } from "../dict/allIgnoreMiddleWords";
import { restrictedLastWords, wordTable } from "../dict/restrictedLastWords";
import { concatWordSeparater } from "../dict/concatWordSeparater";
import { allSymbolChar, isKeyValid } from "../dict/keyRegs";
import { unitWordDict } from "../dict/unitWordDict";
import { validOneCharItem } from "../dict/validOneCharItem";

export const checkClaimMatch = (
  claims,
  claim,
  regExpsOrigin,
  concatRegExp,
  concatSymRegExp,
  mainElement,
  regExpWithWrongChar,
  content,
  firstIndex,
  descriptionOfElementMap,
  figureOfDrawingsMap,
  allModeForInventionParagraphDetails,
  manuallyAddValues
) => {
  // Test
  // console.log(content);
  // console.log(
  //   regExpsOrigin.map((reg) => handleSpecialChar(reg.value)).join("|")
  // );
  // console.log(RegExp(`^(${regExpWithWrongChar})`));
  // debugger;
  // Test
  // if (
  //   /^，其中該電感組件係設置於由該電性絕緣隔板、該金屬外殼、以及該高導熱陶瓷基/.test(
  //     content
  //   )
  // ) {
  //   console.log(claim);
  //   debugger;
  // }
  const regExpWithMainElement = mainElement
    .split("")
    .reduce(
      (a, e, ii) => [
        ...a,
        mainElement.slice(0, ii) +
          "[\\u4E00-\\u9FFF]" +
          mainElement.slice(ii + 1),
      ],
      []
    )
    .join("|");

  // 如果(前述|該)) 又加了新東西，checkIllegalAttach filter 那邊也要改
  // 尋找所有的「該」
  let thisStartIndex = [
    ...content.matchAll(RegExp(`(${allThisWords()})(${allUnitWords()})?`, "g")),
  ].map((match) => {
    if (match[2]) {
      return {
        realStart: match.index,
        matchStart: match.index + match[1].length + match[2].length,
        thisWord: match[1],
        unitWord: match[2],
      };
    }
    return {
      realStart: match.index, //realStart: 「該/前述(複數個)」的位置
      matchStart: match.index + match[1].length, // matchStart:「該/前述(複數個)」下一個字的位置
      thisWord: match[1],
      unitWord: "",
    };
  });

  // Test
  // if (
  //   /^，其中該處理單元更包括一二維條碼產生模組，該二維條碼產生模組係供當該購買者透過該商品購物資訊框購買對應的各該商品時，/.test(
  //     content
  //   )
  // ) {
  //   console.log([
  //     ...content.matchAll(
  //       RegExp(`(${allThisWords()})(${allUnitWords()})?一?個?`, "g")
  //     )
  //   ]);
  //   debugger;
  // }

  // Test
  // if (/^，其能受控於外部的一控制系統，該沉水泵浦包括/.test(content)) {
  //   console.log("before match regExpsOrigin");
  //   console.log(regExpsOrigin);
  //   console.log(`before non sorted regexpsOrigin`);
  //   console.log([...regExpsOrigin.map((reg) => handleSpecialChar(reg.value))]);
  //   console.log(`before match sorted Reg`);
  //   console.log(
  //     [...regExpsOrigin.map((reg) => handleSpecialChar(reg.value))].sort(
  //       (a, b) => b.length - a.length
  //     )
  //   );
  //   console.log(
  //     RegExp(
  //       `(${allThisWords()})(${allUnitWords()})?一?(${[
  //         ...regExpsOrigin.map((reg) => handleSpecialChar(reg.value))
  //       ]
  //         .sort((a, b) => b.length - a.length)
  //         .join("|")})`,
  //       "g"
  //     )
  //   );
  //   debugger;
  // }

  // 「該」後面的元件在符號說明裡面
  /*
  console.log(
    RegExp(
      `(${allThisWords()})(${allUnitWords()})?((第[一二三四五六七八九十]([${concatWordSeparater}]第?[一二三四五六七八九十])+(${concatRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}-~']*)\\)?(([、,]\\(?[${allSymbolChar}-~']+\\)?)*))`,
      "ig"
    )
  );
  debugger;
  */

  let concatMatches = [];
  if (concatRegExp !== "") {
    /*
    const concatMatchReg = RegExp(
      `(${allThisWords()})(${allUnitWords()})?((第[一二三四五六七八九十]([${concatWordSeparater}]第?[一二三四五六七八九十])+(${concatRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}-~']*)\\)?(([、,]\\(?[${allSymbolChar}-~']+\\)?)*))`,
      "ig"
    );
*/

    const concatMatchReg = RegExp(
      `(${allThisWords()})(${allUnitWords()})?((第[一二三四五六七八九十]([${concatWordSeparater}](${allThisWords()})第?[一二三四五六七八九十])+(${concatRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}-~']*)\\)?(([、,]\\(?[${allSymbolChar}-~']+\\)?)*))`,
      "ig"
    );

    concatMatches = [
      ...concatMatches,
      ...content.matchAll(concatMatchReg),
    ].sort((a, b) => a.index - b.index);

    // Test
    /*
    if (concatMatches.length > 0) {
      console.log(concatMatches);
      debugger;
    }
    */
  }
  if (concatSymRegExp !== "") {
    const concatSymMatchReg = RegExp(
      `(${allThisWords()})(${allUnitWords()})?(([${symetricPrefix()}]([${concatWordSeparater}](${allThisWords()})[${symetricPrefix()}])+(${concatSymRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}-~']*)\\)?(([、,]\\(?[${allSymbolChar}-~']+\\)?)*))`,
      "ig"
    );
    concatMatches = [
      ...concatMatches,
      ...content.matchAll(concatSymMatchReg),
    ].sort((a, b) => a.index - b.index);
  }

  // console.log(concatMatches);

  // 先找手動加入的元件
  let manuallyAddedMatches = [];
  if (manuallyAddValues.length > 0) {
    const manuallyAddedMatchReg = RegExp(
      `(${allThisWords()})(${allUnitWords()})?(${[
        ...manuallyAddValues.map((v) => handleSpecialChar(v)),
      ]
        .sort((a, b) => b.length - a.length)
        .join("|")})`,
      "g"
    );

    manuallyAddedMatches = [...content.matchAll(manuallyAddedMatchReg)]
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
        const matchIndex = regExpsOrigin.map((o) => o.value).indexOf(match[3]);
        return {
          group: stringToUnicode(
            (matchIndex >= 0 &&
              getMapValues(
                descriptionOfElementMap,
                figureOfDrawingsMap,
                regExpsOrigin[matchIndex]
              )?.values[0]) ||
              regExpsOrigin[matchIndex].value
          ),

          // group: descriptionOfElementMap[regExpsOrigin[matchIndex].key]
          //   ? stringToUnicode(
          //       descriptionOfElementMap[regExpsOrigin[matchIndex].key].values[0]
          //     )
          //   : stringToUnicode(regExpsOrigin[matchIndex].value),
          value: match[3],
          // item: descriptionOfElementMap[regExpsOrigin[matchIndex].key]
          //   ? descriptionOfElementMap[regExpsOrigin[matchIndex].key].values[0]
          //   : regExpsOrigin[matchIndex].value,
          item:
            (matchIndex >= 0 &&
              getMapValues(
                descriptionOfElementMap,
                figureOfDrawingsMap,
                regExpsOrigin[matchIndex]
              )?.values[0]) ||
            regExpsOrigin[matchIndex].value,
          start: match.index + match[0].length - match[3].length,
          realStart: match.index, //「該/前述」的位置
          end: match.index + match[0].length,
          // pathIsOK: false,
          isInDescriptionOfElementMap: true,
        };
      });
  }

  const matchReg = RegExp(
    `(${allThisWords()})(${allUnitWords()})?(${[
      ...regExpsOrigin.map((reg) => handleSpecialChar(reg.value)),
    ]
      .sort((a, b) => b.length - a.length)
      .join("|")})`,
    "g"
  );

  // console.log(matchReg);
  // debugger;

  let matches = [...content.matchAll(matchReg)]
    .filter((match) => regExpsOrigin.map((el) => el.value).includes(match[3]))
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
        !manuallyAddedMatches.some(
          (mt) =>
            !(
              match.index + match[0].length <= mt.realStart ||
              match.index >= mt.end
            )
        )
    )
    .map((match) => {
      const matchIndex = regExpsOrigin.map((o) => o.value).indexOf(match[3]);
      return {
        group: stringToUnicode(
          (matchIndex >= 0 &&
            getMapValues(
              descriptionOfElementMap,
              figureOfDrawingsMap,
              regExpsOrigin[matchIndex]
            )?.values[0]) ||
            regExpsOrigin[matchIndex].value
        ),
        // group: descriptionOfElementMap[regExpsOrigin[matchIndex].key]
        //   ? stringToUnicode(
        //       descriptionOfElementMap[regExpsOrigin[matchIndex].key].values[0]
        //     )
        //   : stringToUnicode(regExpsOrigin[matchIndex].value),
        value: match[3],
        item:
          (matchIndex >= 0 &&
            getMapValues(
              descriptionOfElementMap,
              figureOfDrawingsMap,
              regExpsOrigin[matchIndex]
            )?.values[0]) ||
          regExpsOrigin[matchIndex].value,
        // item: descriptionOfElementMap[regExpsOrigin[matchIndex].key]
        //   ? descriptionOfElementMap[regExpsOrigin[matchIndex].key].values[0]
        //   : regExpsOrigin[matchIndex].value,
        start: match.index + match[0].length - match[3].length,
        realStart: match.index, //「該/前述」的位置
        end: match.index + match[0].length,
        // pathIsOK: false,
        isInDescriptionOfElementMap: true,
      };
    });

  matches = [...manuallyAddedMatches, ...matches];

  concatMatches
    .map((match) => {
      if (
        match[9] &&
        RegExp(`[${allSymbolChar}']+$`, "i").test(match[8]) &&
        /^[@θ%度˚℃]/.test(content.slice(match.index + match[0].length))
      ) {
        match[0] = match[0].split(/[、,]/).slice(0, -1).join("、");
        match[3] = match[3].split(/[、,]/).slice(0, -1).join("、");
        match[9] = match[9].split(/[、,]/).slice(0, -1).join("、");
        match[10] = match[10].split(/[、,]/).slice(0, -1).join("、");
      }
      return match;
    })
    .forEach((match) => {
      // console.log(match);
      // debugger;
      let keyBeenModified = false;
      const item = match[4]; // 元件
      const value = match[3]; // 元件+符號
      const items = item.split(RegExp(`[${concatWordSeparater}]`)).map((it) => {
        if (item.startsWith("第")) {
          return "第" + it[it.match(/[一二三四五六七八九十]/).index] + match[7];
        } else {
          return it[it.match(RegExp(`[${symetricPrefix()}]`)).index] + match[7];
        }
        // return "第" + it[it.match(/[一二三四五六七八九十]/).index] + match[6];
      });

      // Test
      // console.log("match", match);
      // console.log("item", item);
      // console.log("items", items);
      // debugger;

      let keys =
        match[9] === ""
          ? [match[8].replaceAll(/[()]/g, "")]
          : match[9]
          ? [
              match[8],
              ...match[9]
                .replaceAll(/[()]/g, "")
                .split(/[、,]/)
                .filter((e) => e !== ""),
            ]
          : [""];
      // if (/.+[~-].+/.test(keys[0])) {
      //   keyBeenModified = true;
      //   keys = getKeyInRange(keys[0]);
      // }
      if (keys.some((curKey) => /.+[~-].+/.test(curKey))) {
        // keyBeenModified = true;
        keys = keys.reduce((accKeys, curKey) => {
          if (/.+[-~～].+/.test(curKey)) {
            const _keyInRange = getKeyInRange(curKey);
            if (_keyInRange.length > 0) {
              keyBeenModified = true;
            }
            return [...accKeys, ..._keyInRange];
          }
          return [...accKeys, curKey];
        }, []);
        // keys = getKeyInRange(keys[0]);
      }
      keys =
        keys.length === 1 && keys[0] === ""
          ? keys
          : keys
              .filter((k) => k !== "")
              .filter((k) => !isKeyInReserve(k) && isKeyValid(k));
      keys = Array.from(new Set(keys));

      matches.push({
        type: "concat",
        realStart: match.index, //「該/前述」的位置
        start: match.index + match[0].length - match[3].length,
        item,
        value,
        items,
        keys,
        keyBeenModified,
      });
    });

  matches.sort((a, b) => a.realStart - b.realStart);

  /*
  if (claim.num === 7) {
    console.log(matches);
    debugger;
  }
  */
  // Test
  // if (
  //   /^，其中該些光電轉換單元至少包含一電晶體層，形成於該基板上，其中該電晶體層包含該至少一/.test(
  //     content
  //   )
  // ) {
  //   console.log(`sorted Reg`);
  //   console.log(
  //     [...regExpsOrigin.map((reg) => handleSpecialChar(reg.value))].sort(
  //       (b, a) => b.length - a.length
  //     )
  //   );
  //   console.log("regExpsOrigin");
  //   console.log(regExpsOrigin);
  //   console.log(
  //     regExpsOrigin.map((reg) => handleSpecialChar(reg.value)).join("|")
  //   );
  //   console.log("matchReg: line 52");
  //   console.log(matchReg);
  //   console.log(matches);
  //   console.log("thisStartIndex:");
  //   console.log(thisStartIndex);
  //   debugger;
  // }

  // 扣掉已經找到的部分
  thisStartIndex = thisStartIndex.filter(
    ({ realStart }) =>
      !matches.map((match) => match.realStart).includes(realStart)
  );

  // if (/^，其中，各該兩鋼性制動件為鋼珠；/.test(content)) {
  //   console.log("matchReg line 83");
  //   console.log(matchReg);
  //   console.log("we get all this in table");
  //   console.log("matches");
  //   console.log(matches);
  //   console.log(matches.map((mm) => mm.realStart));
  //   console.log(thisStartIndex);
  //   debugger;
  // }
  // console.log(content);

  // 剩下的「該」後面接沒有在符號說明的元件
  thisStartIndex.forEach(({ matchStart, realStart, thisWord }, thisIdx) => {
    const nextThis =
      (thisStartIndex[thisIdx + 1] && thisStartIndex[thisIdx + 1].realStart) ||
      100000000;
    const nextMatch =
      (matches.find((match) => match.realStart > matchStart) &&
        matches.find((match) => match.realStart > matchStart).realStart) ||
      100000000;
    let maxEnd = nextThis < nextMatch ? nextThis : nextMatch;

    maxEnd = maxEnd >= 100000000 ? content.length - 1 : maxEnd;

    let i = matchStart;

    // if (
    //   content ===
    //   "，其中，所述採樣棒由該折點處至該吸水泡棉上端長度係大於該試管滴頭並小於或等於該管滴頭與該蓋體合併之長度。"
    // ) {
    // console.log("current start at: ", matchStart);
    // console.log("nextThis: ", nextThis);
    // console.log("nextMatch: ", nextMatch);
    // console.log("maxEnd: ", maxEnd);
    //   debugger;
    // }

    // const i = /^[一個]/.test(content.slice(matchStart))
    //   ? matchStart + 1
    //   : matchStart;

    // let item =
    //   maxEnd - i > 2
    //     ? content.substring(i, i + 2) +
    //       content.substring(i + 2, maxEnd).split(/[、，,:：；\s\-/0-9a-z]/i)[0]
    //     : content.substring(i, maxEnd);

    let item;

    // console.log(itemRegExp);
    // debugger;

    let followContent = content.substring(i, maxEnd).split("@##@")[0];
    let followContentFirstCharNoCheck = false;

    if (shiftFollowContent(content[i - 1], followContent)) {
      followContent = content[i - 1] + followContent;
      i--;
      followContentFirstCharNoCheck = true;
    }

    const itemRegExp = RegExp(
      `^[^${getLimitedChar()}]{1,3}?(${[
        ...regExpsOrigin.map((reg) => handleSpecialChar(reg.value)),
      ]
        .sort((a, b) => b.length - a.length)
        .join("|")})`
    );

    if (
      itemRegExp.test(followContent) &&
      RegExp(
        `(第[一二三四五六七八九十]|${symetricPrefix().split("").join("|")})$`
      ).test(
        followContent.slice(
          0,
          followContent.indexOf(followContent.match(itemRegExp)[1])
        )
      )
    ) {
      // 符號說明是「連接器」，請求項是「第一連接器」或「左連接器」;

      // Test
      /*
      if (claim.num === 1) {
        console.log(followContent);
        console.log(
          followContent
            .slice(0, followContent.indexOf(followContent.match(itemRegExp)[1]))
            .match(
              RegExp(
                `(第[一二三四五六七八九十]|${symetricPrefix()
                  .split("")
                  .join("|")})$`
              )
            )
        );
        debugger;
      }
    */
      const itemPrefixMatch = followContent
        .slice(0, followContent.indexOf(followContent.match(itemRegExp)[1]))
        .match(
          RegExp(
            `(第[一二三四五六七八九十]|${symetricPrefix()
              .split("")
              .join("|")})$`
          )
        );
      item = itemPrefixMatch[0] + followContent.match(itemRegExp)[1];

      matches.push({
        group: stringToUnicode(item),
        value: item,
        item,
        start: i + itemPrefixMatch.index,
        end: i + itemPrefixMatch.index + item.length,
        // pathIsOK: false,
        realStart,
        // isInDescriptionOfElementMap: doubleModifiedItem ? true : false
        isInDescriptionOfElementMap: true,
      });

      // debugger;
      return;
    } else if (
      itemRegExp.test(followContent) &&
      RegExp(`^[\u4E00-\u9FFF]{1,3}`).test(
        followContent.slice(
          0,
          followContent.indexOf(followContent.match(itemRegExp)[1])
        )
      )
    ) {
      // 符號說明是「連接器」，請求項是「兩旁的連接器」
      // 「兩旁」不在 unitDict 裡面,但不會差在多
      const itemMatch = followContent.match(itemRegExp);

      item = itemMatch[1];

      /*
      console.log(followContent);
      console.log(itemRegExp);
      console.log(itemMatch);
      console.log("item", item);
      console.log("prefix length:", itemMatch[0].length - itemMatch[1].length);
      debugger;
      */

      matches.push({
        group: stringToUnicode(item),
        value: item,
        item,
        start: i + itemMatch[0].length - itemMatch[1].length,
        end: i + itemMatch[0].length - itemMatch[1].length + item.length,
        // pathIsOK: false,
        realStart,
        // isInDescriptionOfElementMap: doubleModifiedItem ? true : false
        isInDescriptionOfElementMap: true,
      });

      return;
    }

    // Test
    /*     if (followContent.startsWith("控制模組電性連接") && claim.num === 2) {
      console.log(followContent);
      console.log(`i start: ${i}`);
      console.log(`end: ${maxEnd}`);
      console.log(`nextThis: ${nextThis}`);
      console.log(`nextMatch: ${nextMatch}`);
      debugger;
    } */

    let finalItem = "";
    let modifiedItem;
    let isFind;
    let shouldLookupDB = false;

    // Test
    // if (claim.num === 1 && /^撥針舌/.test(followContent)) {
    //   console.log(followContent);
    //   console.log(
    //     "true or false",
    //     [
    //       claim.mainElement,
    //       ...claim.matchedClaimsNum.map((n) => claims[n - 1].mainElement)
    //     ]
    //       // .map((mainElement) => mainElement.split(/[^\u4E00-\u9FFF]/)[0])
    //       .map((mainElement) => mainElement.split(/[\\(\\)]/)[0])
    //       .map((mainElement) =>
    //         mainElement.split(/[之的]/).length > 1
    //           ? [mainElement, ...mainElement.split(/[之的]/)]
    //           : [mainElement]
    //       )
    //       .flat()
    //       .find((el) => RegExp(`^${el}`).test(followContent))
    //   );
    //   debugger;
    // }

    // Test
    // if (claim.num === 3 && followContent === "目標發卡銀行伺服器單元") {
    //   console.log("not in description: ", followContent);
    //   console.log(
    //     "itemRegExp.test(followContent)",
    //     itemRegExp.test(followContent)
    //   );
    //   console.log(
    //     "followContent.match(itemRegExp)",
    //     followContent.match(itemRegExp)
    //   );
    //   console.log(
    //     "followContent.indexOf(followContent.match(itemRegExp)[1])",
    //     followContent.indexOf(followContent.match(itemRegExp)[1])
    //   );
    //   console.log(
    //     "true or false",
    //     RegExp(allIgnoreMiddleWords()).test(
    //       followContent.slice(
    //         0,
    //         followContent.indexOf(followContent.match(itemRegExp)[1])
    //       )
    //     )
    //   );
    //   console.log("finalItem", followContent.match(itemRegExp)[0]);
    //   debugger;
    // }

    // Test
    /*
    if (claim.num === 10 && /^第二/.test(followContent)) {
      console.log(RegExp(allIgnoreMiddleWords()));
      console.log(
        followContent.slice(
          0,
          followContent.indexOf(followContent.match(itemRegExp)[1])
        )
      );

      console.log(
        RegExp(
          `^第[一二三四五六七八九十]|${symetricPrefix().split("").join("|")}$`
        )
      );

      console.log(
        !RegExp(allIgnoreMiddleWords()).test(
          followContent.slice(
            0,
            followContent.indexOf(followContent.match(itemRegExp)[1])
          )
        )
      );

      // console.log(itemRegExp);
      // console.log(followContent);
      // console.log(followContent.match(itemRegExp));
      debugger;
    }
    */

    // Test
    // console.log(followContent);
    // debugger;

    if (maxEnd - i <= 2) {
      item = followContent;
    } else if (
      [
        claim.mainElement,
        ...claim.matchedClaimsNum.map((n) => claims[n - 1].mainElement),
      ]
        // .map((mainElement) => mainElement.split(/[^\u4E00-\u9FFF]/)[0])
        .map((mainElement) => mainElement.split(/[\\(\\)]/)[0])
        .map((mainElement) =>
          mainElement.split(/[之的]/).length > 1
            ? [mainElement, ...mainElement.split(/[之的]/)]
            : [mainElement]
        )
        .flat()
        .some((el) => RegExp(`^${el}`).test(followContent))
    ) {
      // it means it's part of mainElement
      item = finalItem = [
        claim.mainElement,
        ...claim.matchedClaimsNum.map((n) => claims[n - 1].mainElement),
      ]
        // .map((mainElement) => mainElement.split(/[^\u4E00-\u9FFF]/)[0])
        .map((mainElement) => mainElement.split(/[\\(\\)]/)[0])
        .map((mainElement) =>
          mainElement.split(/[之的]/).length > 1
            ? [mainElement, ...mainElement.split(/[之的]/)]
            : [mainElement]
        )
        .flat()
        .find((el) => RegExp(`^${el}`).test(followContent));
      isFind = true;
    } else if (
      itemRegExp.test(followContent) &&
      followContent.indexOf(followContent.match(itemRegExp)[1]) <= 3 &&
      !RegExp(allIgnoreMiddleWords()).test(
        followContent.slice(
          0,
          followContent.indexOf(followContent.match(itemRegExp)[1])
        )
      )
    ) {
      // 符號說明是「連接器」，請求項是「XXX連接器」;
      // if (claim.num === 10) {
      //   console.log("here", followContent);
      //   console.log(followContent.match(itemRegExp)[0]);
      //   debugger;
      // }

      // console.log(content.substring(i, maxEnd));
      // console.log(followContent.match(itemRegExp)[0]);

      // For test, it should not be commented
      // item = followContent.match(itemRegExp)[0];
      item = followContent.match(itemRegExp)[0];
      finalItem = followContent.match(itemRegExp)[0];
      isFind = true;

      // test
      // console.log("index of i: ", i);
      // console.log("prev content: ", followContent);
      // console.log(item);
      // debugger;
    } else if (
      checkWrongElementInModeForInvention(
        followContent,
        allModeForInventionParagraphDetails
      ).isFind
    ) {
      // it means We find a wrong element from mode-for-invention
      console.log("We find a wrong element from mode-for-invention");
      item = finalItem = checkWrongElementInModeForInvention(
        followContent,
        allModeForInventionParagraphDetails
      ).item;
      console.log("item: ", item);
      console.log("finalItem: ", finalItem);
      // debugger;
      isFind = true;
    } else if (
      followContent
        .split(
          RegExp(`[、，,:：；?.+(){}「」\\/\\[\\]\\s${allSymbolChar}-~]`, "i")
        )[0]
        .split(RegExp(`${allSeperatedWords()}`))[0].length > 0 &&
      [...regExpsOrigin.map((reg) => handleSpecialChar(reg.value))]
        .sort((a, b) => b.length - a.length)
        .find((reg) =>
          RegExp(
            `(${
              followContent
                .split(
                  RegExp(
                    `[、，,:：；?.+(){}「」\\/\\[\\]\\s${allSymbolChar}-~]`,
                    "i"
                  )
                )[0]
                .split(RegExp(`${allSeperatedWords()}`))[0]
            })$`
          ).test(reg)
        )
    ) {
      // it means we found a match after subtracting allSeperatedWords
      item = finalItem = followContent
        .split(
          RegExp(`[、，,:：；?.+(){}「」\\/\\[\\]\\s${allSymbolChar}-~]`, "i")
        )[0]
        .split(RegExp(`${allSeperatedWords()}`))[0];
      isFind = true;
    } else {
      // item =
      //   content.substring(i, i + 2) +
      //   content.substring(i + 2, maxEnd).split(/[、，,:：；\s\-/]/i)[0];
      item =
        followContent.slice(0, 2) +
        followContent.slice(2).split(/[、，,:：；\s\-/]/i)[0];
    }

    /*
else if (
      !finalItem &&
      !isFind &&
      RegExp(`^(${regExpWithMainElement})`).test(item)
    ) {
      // it means "checkItemInModeForInvention" doesn't work and we found it's close to mainElement

      // Test
      // console.log("if 1");
      // debugger;
      doubleModifiedItem = item.match(RegExp(`^(${regExpWithMainElement})`))[0];

      // doubleModifiedItem =
      //   doubleModifiedItem.length > 2
      //     ? doubleModifiedItem.substring(0, 2) +
      //       doubleModifiedItem
      //         .substring(2, doubleModifiedItem.length)
      //         .split(/係|之|的|和|與|且|該|一/)[0]
      //     : doubleModifiedItem;
    } else if (
      !finalItem &&
      !isFind &&
      RegExp(`^(${regExpWithWrongChar})`).test(item)
    ) {
      // it means "checkItemInModeForInvention" doesn't work and we found a close one

      // Test
      // console.log("if 2");
      // debugger;
      doubleModifiedItem = item.match(RegExp(`^(${regExpWithWrongChar})`))[0];

      // doubleModifiedItem =
      //   doubleModifiedItem.length > 2
      //     ? doubleModifiedItem.substring(0, 2) +
      //       doubleModifiedItem
      //         .substring(2, doubleModifiedItem.length)
      //         .split(/係|之|的|和|與|且|該|一/)[0]
      //     : doubleModifiedItem;
    }
    */

    // if (!/^[\u4E00-\u9FFF]/.test(item)) {
    //   return;
    // }

    // const itemPrefix = /^第./.test(item) ? item.slice(0, 2) : "";
    // let itemBody = item.slice(itemPrefix.length, item.length);
    // const itemEndMatch = itemBody.match(
    //   RegExp(
    //     `(${allThisWords()
    //       .split("|")
    //       .concat(allUnitWords().split("|"))
    //       .sort((a, b) => b.length - a.length)
    //       .join(
    //         "|"
    //       )}|@|、|，|、|，|-|；|:|,|/|\\\\|\\?|\\.|\\+|\\[|\\]|\\(|\\)|{|}|「|」)`
    //   )
    // );
    // if (itemEndMatch) {
    //   itemBody = itemBody.slice(0, itemEndMatch.index);
    // }
    // item = itemPrefix + itemBody;

    if (!finalItem) {
      shouldLookupDB = true;
      // Test
      // if (item.startsWith("控制模組電性")) {
      //   console.log(item);
      //   console.log(modifyItem(item, followContentFirstCharNoCheck));
      //   debugger;
      // }

      item = modifyItem(item, followContentFirstCharNoCheck);
      if (allIgnoreThisItems(item, thisWord)) {
        return;
      }
      console.log(`claim ${claim.num} 不在的「該」: ${item}`);

      // if (
      //   item.length === 0 ||
      //   (item.length >= 2 &&
      //     !/^第./.test(item) &&
      //     RegExp(
      //       `(${allThisWords()
      //         .split("|")
      //         .concat(allUnitWords().split("|"))
      //         .sort((a, b) => b.length - a.length)
      //         .join(
      //           "|"
      //         )}|@|、|，|、|，|-|；|:|,|/|\\\\|\\?|\\.|\\+|\\[|\\]|\\(|\\)|{|}|「|」)`
      //     ).test(item))
      // ) {
      //   return;
      // }

      // Test

      const prevClaimResult = checkPreviousClaimContent(
        claims,
        claim,
        item,
        realStart,
        firstIndex
      );
      // modifiedItem = prevClaimResult.item;
      // isFind = prevClaimResult.isFind;

      const prevModeForInventionResult = checkItemInModeForInvention(
        item,
        allModeForInventionParagraphDetails
      );
      // modifiedItem = prevModeForInventionResult.item;
      // isFind = prevModeForInventionResult.isFind;

      console.log(
        `去找請求項前面的內容之後變成: ${prevClaimResult.item}, 原本是: ${item}, isFind: ${prevClaimResult.isFind}`
      );
      console.log(
        `去找實施方式的內容之後變成: ${prevModeForInventionResult.item}, 原本是: ${item}, isFind: ${prevModeForInventionResult.isFind}`
      );

      let possibleResult = "";
      if (
        prevClaimResult.isFind &&
        prevClaimResult.item.length >= 3 &&
        prevClaimResult.item.length <= 10
      ) {
        console.log("選擇用:請求項前面的內容");
        possibleResult = prevClaimResult.item;
      }
      if (
        prevModeForInventionResult.isFind &&
        prevModeForInventionResult.item.length >= 3 &&
        prevModeForInventionResult.item.length <= 10 &&
        prevModeForInventionResult.item.length > possibleResult.length
      ) {
        console.log("選擇用:實施方式的內容");
        possibleResult = prevModeForInventionResult.item;
      }

      if (possibleResult) {
        modifiedItem = possibleResult;
        isFind = true;
      } else {
        modifiedItem = item;
        isFind = false;
        if (thisWord === "其中") {
          return;
        }
      }
    }

    // Test
    // if (claim.num === 5 && item === "環境訊號更包含") {
    //   console.log("after checkPreviousClaimContent");
    //   console.log("isFind: ", isFind);
    //   console.log("item: ", item);
    //   console.log("modifiedItem: ", modifiedItem);
    //   debugger;
    // }

    // 如果 modifiedItem 找到的字串太長或太短，無效，重新再找
    /*
    if (
      !finalItem &&
      (!isFind || modifiedItem.length > 10 || modifiedItem.length < 3)
    ) {
      modifiedItem = item;
      isFind = false;
    }
    */

    /*
    if (!finalItem && !isFind) {
      const prevModeForInventionResult = checkItemInModeForInvention(
        item,
        allModeForInventionParagraphDetails
      );
      modifiedItem = prevModeForInventionResult.item;
      isFind = prevModeForInventionResult.isFind;

      console.log(
        `去找實施方式的內容之後變成: ${modifiedItem}, 原本是: ${item}, isFind: ${isFind}`
      );
    }
    */

    // Test
    /*
    if (item === "第二材料為金屬材料") {
      console.log("after checkItemInModeForInvention");
      console.log("item: ", item);
      console.log("modifiedItem: ", modifiedItem);
      debugger;
    }
    */

    // 如果 modifiedItem 找到的字串太長或太短，無效，重新再找
    /*
    if (
      !finalItem &&
      (!isFind || modifiedItem.length > 10 || modifiedItem.length < 3)
    ) {
      if (thisWord === "其中") {
        return;
      }
      modifiedItem = item;
      isFind = false;
    }
    */

    // 表示 1.去找請求項前面的內容 2. 去找實施方式的內容 都失敗
    if (!isFind && RegExp(`^(${regExpWithMainElement})`).test(followContent)) {
      // it means we found it's close to mainElement
      item = followContent.match(RegExp(`^(${regExpWithMainElement})`))[0];
      // finalItem = followContent.match(RegExp(`^(${regExpWithMainElement})`))[0];
      isFind = true;
    } else if (
      !isFind &&
      RegExp(`^(${regExpWithWrongChar})`).test(followContent)
    ) {
      // it means we found a close one
      item = followContent.match(RegExp(`^(${regExpWithWrongChar})`))[0];
      // finalItem = followContent.match(RegExp(`^(${regExpWithWrongChar})`))[0];
      isFind = true;
    }

    // Test
    /*if (claim.num === 8 && modifiedItem === "轉軸之") {
      console.log("modifiedItem: ", modifiedItem);
      console.log("finalItem: ", finalItem);
      console.log("isFind: ", isFind);
      debugger;
    }*/

    // Test
    // if (
    //   content ===
    //   "，其中，所述採樣棒由該折點處至該吸水泡棉上端長度係大於該試管滴頭並小於或等於該管滴頭與該蓋體合併之長度。"
    // ) {
    //   console.log("item:", [item]);
    //   console.log("modifiedItem:", [modifiedItem]);
    //   // debugger;
    // }

    if (!finalItem && !isFind) {
      // it means all the above methods fail

      if (!/^[\u4E00-\u9FFF]/.test(item)) {
        return;
      }

      modifiedItem =
        item.length >= 2
          ? item.substring(0, 2) +
            item
              .substring(2, item.length)
              .split(
                RegExp(
                  `[、，,:：；?.+(){}「」\\/\\[\\]\\s${allSymbolChar}-~]`,
                  "i"
                )
              )[0]
              // .split(/[、，,:：；?.+(){}「」\\/\\[\]\s\-/0-9a-z]/i)[0]
              .split(RegExp(`${allSeperatedWords()}`))[0]
          : item;

      // modifiedItem = modifiedItem.match(/(以及|至|到|及|和|或)$/)
      //   ? modifiedItem.slice(
      //       0,
      //       modifiedItem.match(/(以及|至|到|及|和|或)$/).index
      //     )
      //   : modifiedItem;

      // // console.log("modifiedItem:", [modifiedItem]);
      // modifiedItem =
      //   modifiedItem.length > 8 ? modifiedItem.substring(0, 8) : modifiedItem;
      // // console.log("modifiedItem:", [modifiedItem]);
      // // debugger;
    }

    if (!finalItem) {
      // 如果最後一個字是 「以及|至|到|及|和|或」 -> 濾掉

      if (
        modifiedItem.match(RegExp(`(${restrictedLastWords})$`)) ||
        modifiedItem.match(RegExp(`(${allSeperatedWords()})$`))
      ) {
        if (
          wordTable[modifiedItem[modifiedItem.length - 1]] &&
          wordTable[modifiedItem[modifiedItem.length - 1]].find((w) =>
            modifiedItem.endsWith(w + modifiedItem[modifiedItem.length - 1])
          )
        ) {
          finalItem = modifiedItem;
        } else {
          finalItem = modifiedItem.slice(
            0,
            (
              modifiedItem.match(RegExp(`(${restrictedLastWords})$`)) ||
              modifiedItem.match(RegExp(`(${allSeperatedWords()})$`))
            ).index
          );
        }
      } else {
        finalItem = modifiedItem;
      }

      finalItem =
        finalItem.length > 10 ? finalItem.substring(0, 10) : finalItem;
    }

    console.log(
      `claim ${claim.num}, 最後變成: ${finalItem}, isFind: ${isFind}`
    );

    // Test
    // if (finalItem === "運行" && claim.num === 1) {
    //   console.log("isFind: ", isFind);
    //   debugger;
    // }

    if (
      finalItem === "" ||
      RegExp(`[^\\u4E00-\\u9FFF${allSymbolChar}]`, "i").test(finalItem) ||
      limitedChar.includes(finalItem) ||
      /^第[一二三四五六七八九十]?$/.test(finalItem)
    ) {
      return;
    }

    if (finalItem.length === 1 && !validOneCharItem.includes(finalItem)) return;

    // console.log(
    //   `<p>沒在符號說明的「該」 start: ${
    //     i + firstIndex
    //   }, item: ${item}, maxEnd: ${maxEnd + firstIndex}</p>`
    // );
    matches.push({
      group: stringToUnicode(finalItem),
      value: finalItem,
      item: finalItem,
      start: i,
      end: i + finalItem.length,
      // pathIsOK: false,
      realStart,
      // isInDescriptionOfElementMap: doubleModifiedItem ? true : false
      isInDescriptionOfElementMap: false,
      shouldLookupDB,
      followContent,
    });
  }); // each 剩下的「該」後面接沒有在符號說明的元件

  let finalMatches = [];
  matches.forEach((match) => {
    if (match.type === "concat") {
      match.items.forEach((_item, _itemIdx) => {
        const matchIndex = regExpsOrigin.map((o) => o.value).indexOf(_item);
        let value = match.item.split(RegExp(`[${concatWordSeparater}]`))[
          _itemIdx
        ];
        let start = match.start;
        match.item
          .split(RegExp(`[${concatWordSeparater}]`))
          .filter((iitt, iiddxx) => iiddxx < _itemIdx)
          .forEach((iitt) => {
            start += iitt.length + 1;
          });

        if (RegExp(`^(${allThisWords()})`).test(value)) {
          const _itemMatch = value.match(RegExp(`^(${allThisWords()})`));
          value = value.slice(_itemMatch[1].length);
          start += _itemMatch[1].length;
          // console.log(_itemMatch);
          // console.log(start);
          // console.log(value);
        }

        const end =
          _itemIdx === match.items.length - 1
            ? match.start + match.item.length
            : start + value.length;
        const key =
          match.keys[_itemIdx] && match.keys[_itemIdx] !== ""
            ? match.keys[_itemIdx]
            : null;
        const keyStart = key ? match.start + match.value.indexOf(key) : -100;
        const keyEnd = key ? keyStart + key.length : -100;

        finalMatches.push({
          isInDescriptionOfElementMap: true,
          // pathIsOK: false,
          start,
          end,
          group: stringToUnicode(
            (matchIndex >= 0 &&
              getMapValues(
                descriptionOfElementMap,
                figureOfDrawingsMap,
                regExpsOrigin[matchIndex]
              )?.values[0]) ||
              _item
          ),
          // group:
          //   matchIndex >= 0
          //     ? stringToUnicode(regExpsOrigin[matchIndex].value)
          //     : stringToUnicode(_item),
          item:
            (matchIndex >= 0 &&
              getMapValues(
                descriptionOfElementMap,
                figureOfDrawingsMap,
                regExpsOrigin[matchIndex]
              )?.values[0]) ||
            _item,
          // item: matchIndex >= 0 ? regExpsOrigin[matchIndex].value : _item,
          value,
          fullValue: _item,
          keys: key ? [key] : null,
          keyStart,
          keyEnd,
          keyBeenModified: match.keyBeenModified,
          hasOuterKey: key ? true : false,
        });
      });
    } else {
      finalMatches.push(match);
    }
  });

  const hasBeenModifiedMatches = claim.hasBeenModifiedMatches
    ? claim.hasBeenModifiedMatches
    : [];

  finalMatches = [...finalMatches]
    .map((match) => {
      return {
        ...match,
        realStart: match.realStart ? match.realStart + firstIndex : null,
        start: match.start + firstIndex,
        end: match.end + firstIndex,
        keyStart:
          match.keyStart && match.keyStart >= 0
            ? match.keyStart + firstIndex
            : null,
        keyEnd:
          match.keyEnd && match.keyEnd >= 0 ? match.keyEnd + firstIndex : null,
      };
    })
    .filter(
      (match) =>
        !hasBeenModifiedMatches.some(
          (mt) => !(match.end <= mt.start || match.start >= mt.end)
        )
    )
    .concat(hasBeenModifiedMatches)
    .sort((a, b) => a.start - b.start || b.realStart - a.realStart);

  finalMatches = finalMatches.reduce((acc, cur) => {
    if (acc.find((m) => m.start === cur.start)) {
      return [...acc];
    }
    return [...acc, cur];
  }, []);

  // if (/*manuallyAddValues.length > 0 &&*/ claim.num === 4) {
  //   console.log(finalMatches);
  //   debugger;
  // }

  // Test
  // if (
  //   /^，其中該感測組件更包含一溫度感測器，用以感測該環境並產生一溫度資訊，其中該環境訊號更包含該溫度資訊/.test(
  //     content
  //   )
  // ) {
  //   console.log("all matches: ");
  //   console.log(matches);
  //   debugger;
  // }

  return finalMatches;
};

const cutItem = (item) => {
  const itemPrefix = /^第./.test(item) ? item.slice(0, 2) : "";
  let itemBody = item.slice(itemPrefix.length, item.length);
  const itemEndMatch = itemBody.match(RegExp(`${allSeperatedWords()}`));
  if (itemEndMatch) {
    itemBody = itemBody.slice(0, itemEndMatch.index);
  }
  // Test
  // if (item === "付款碼是否已被任") {
  //   console.log("itemPrefix: ", itemPrefix);
  //   console.log("itemEndMatch: ", itemEndMatch);
  //   console.log("itemBody: ", itemBody);
  //   debugger;
  // }

  return itemPrefix + itemBody;
};

const modifyItem = (item, followContentFirstCharNoCheck) => {
  const itemPrefix = /^第./.test(item) ? item.slice(0, 2) : "";
  let itemBody = item.slice(itemPrefix.length, item.length);
  // test
  /*
  if (item.startsWith("個人化充電設定選項之設定")) {
    // console.log(content[i - 1]);
    // console.log(shiftFollowContent(content[i - 1], followContent));
    // console.log(content[i - 1] + followContent);
    console.log(itemBody);
    console.log(
      allThisWords()
        .split("|")
        .concat(allFirstTimeSeparateWord().split("|"))
        .sort((a, b) => b.length - a.length)
    );
    console.log(
      itemBody.match(
        RegExp(
          `(${allThisWords()
            .split("|")
            .concat(allFirstTimeSeparateWord().split("|"))
            .sort((a, b) => b.length - a.length)
            .join(
              "|"
            )}|@|、|，|、|，|-|；|:|,|。|/|\\\\|\\?|\\.|\\+|\\[|\\]|\\(|\\)|{|}|「|」)`
        )
      )
    );
    debugger;
  }
  */
  // test end
  const itemBodyRegExp = RegExp(
    `(${allThisWords()
      .split("|")
      .concat(allFirstTimeSeparateWord().split("|"))
      .filter((ch) => !(followContentFirstCharNoCheck && ch === item[0]))
      .sort((a, b) => b.length - a.length)
      .join(
        "|"
      )}|@|、|，|、|，|-|；|:|,|。|/|\\\\|\\?|\\.|\\+|\\[|\\]|\\(|\\)|{|}|「|」)`
  );
  const itemEndMatch = itemBody.match(itemBodyRegExp);

  // Test
  // if (item.startsWith("控制模組電性連接")) {
  //   console.log(itemBodyRegExp);
  //   console.log(itemEndMatch);
  //   debugger;
  // }

  if (itemEndMatch) {
    itemBody = itemBody.slice(0, itemEndMatch.index);
  }
  return itemPrefix + itemBody;
};

const shiftFollowContent = (prevChar, followContent) => {
  /*if (
    (prevChar === "個" && followContent.startsWith("人")) ||
    (prevChar === "多" && followContent.startsWith("人")) ||
    (prevChar === "二" && followContent.startsWith("元")) ||
    (prevChar === "對" && followContent.startsWith("流"))
  ) {
    return true;
  }*/
  /*return !!unitWordDict.find(
    (dict) => prevChar === dict[0] && followContent.startsWith(dict[1])
  );*/
  // return false;

  return !!Object.keys(unitWordDict).find((startChar) => {
    if (startChar !== prevChar) return false;
    return unitWordDict[startChar].includes(prevChar + followContent[0]);
  });
};
