import { allIgnoreMiddleWords } from "../dict/allIgnoreMiddleWords";
import {
  getLimitedChar,
  getReferWords_1,
  getReferWords_2
} from "../dict/allReferWords";
import { allThisWords } from "../dict/allThisWords";
import { allUnitWords } from "../dict/allUnitWords";

export const checkPreviousClaimContent = (
  claims,
  claim,
  item,
  realStart,
  firstIndex
) => {
  try {
    let itemReg;
    if (item.length <= 2) {
      itemReg = item;
    } else {
      const itemPrefix = /^第./.test(item) ? item.slice(0, 2) : "";
      const itemBody = item.slice(itemPrefix.length, item.length);

      itemReg = itemBody
        .split("")
        .reduce((acc, cur, _i) => {
          if (_i === 0) {
            return [cur];
          }
          return [...acc, acc[acc.length - 1] + cur];
        }, [])
        .filter((it) => it.length >= 2)
        .map((it) => itemPrefix + it)
        .reverse()
        .join("|");
    }

    // Test
    // if (item.startsWith("排氣狀") && claim.num === 9) {
    //   console.log("in the checkPreviousClaimContent");
    //   console.log("item: ", item);
    //   console.log("itemReg: ", itemReg);
    //   console.log("all contents: ", [
    //     claim.content.slice(0, realStart),
    //     ...claim.matchedClaimsNum.map((num) => claims[num - 1].content)
    //   ]);
    //   debugger;
    // }

    let longestMatch = "";
    let isFind = false;

    [
      claim.content.slice(0, realStart + firstIndex),
      ...claim.matchedClaimsNum.map((num) => claims[num - 1].content)
    ].forEach((content) => {
      // const currentClaimsMatches = [...content.matchAll(itemReg, "g")];

      const currentLongestMatches = [
        [
          ...content.matchAll(
            RegExp(
              `(${getReferWords_1()})[^${getLimitedChar()}]{1,8}?(${itemReg})`,
              "g"
            )
          )
        ].map((mp) => {
          mp.newIndex = mp.index + 10000;
          return mp;
        }),
        [
          ...content.matchAll(RegExp(`(${getReferWords_1()})(${itemReg})`, "g"))
        ].map((mp) => {
          mp.newIndex = mp.index + 10000;
          return mp;
        }),
        [
          ...content.matchAll(
            RegExp(
              `(${getReferWords_2()})[^${getLimitedChar()}]{1,8}?(${itemReg})`,
              "g"
            )
          )
        ].map((mp) => {
          mp.newIndex = mp.index + 20000;
          return mp;
        }),
        [
          ...content.matchAll(RegExp(`(${getReferWords_2()})(${itemReg})`, "g"))
        ].map((mp) => {
          mp.newIndex = mp.index + 20000;
          return mp;
        }),
        [...content.matchAll(RegExp(`()(${itemReg})`, "g"))].map((mp) => {
          mp.newIndex = mp.index + 30000;
          return mp;
        })
      ]
        .flat()
        .filter((o) => {
          // Test
          // if (o[2] === "溫室") {
          //   console.log(o);
          //   console.log(content.slice(0, o.index));
          //   debugger;
          // }
          return !RegExp(`(${allThisWords()})(${allUnitWords()})?$`).test(
            content.slice(0, o.index)
          );
        })
        .filter(
          (o) =>
            //!/(前述之|所述之|上述之|係用以|係用來|係用於|若干個|若干種|複數個|複數種|多數個|多數種|若干|一個|一種|二個|二種|複數|前述|所述|上述|其中|多個|多種|多數|具有|包含|包括|多|二|一|個|種|些|和|及|與|或|之|的|係|該|@|、|，|、|，|-|；|:|,|\\|\?|\.|\+|\[|\]|\(|\)|{|}|「|」)/.test(
            !RegExp(allIgnoreMiddleWords()).test(
              o[0]
                // .slice(o[1].length, o[0].length - value.length)
                .slice(o[1].length, o[0].length - o[2].length)
                .replace(/^第./, "")
            )
        )
        .sort(
          (a, b) =>
            // b[0].slice(b[1].length).length - a[0].slice(a[1].length).length ||
            b[2].length - a[2].length ||
            b[0].slice(b[1].length).length - a[0].slice(a[1].length).length ||
            a.newIndex - b.newIndex
        );

      // Test
      // if (claim.num === 5 && item === "環境訊號更包含") {
      //   console.log("itemReg: ", itemReg);
      //   console.log("content: ", content);
      //   console.log("currentLongestMatches: ", currentLongestMatches);
      //   // debugger;
      // }

      if (
        currentLongestMatches[0] &&
        currentLongestMatches[0][2].length > longestMatch.length
      ) {
        longestMatch = currentLongestMatches[0][2];
        isFind = true;
      }
    });

    // Test
    // if (claim.num === 5 && item === "環境訊號更包含") {
    //   console.log(longestMatch);
    //   console.log("isFind: ", isFind);
    //   debugger;
    // }

    return { item: longestMatch === "" ? item : longestMatch, isFind };
  } catch (error) {
    return { item, isFind: false };
  }
};

export const checkItemInModeForInvention = (
  item,
  allModeForInventionParagraphDetails
) => {
  try {
    let itemReg;
    if (item.length <= 2) {
      itemReg = item;
    } else {
      const itemPrefix = /^第./.test(item) ? item.slice(0, 2) : "";
      const itemBody = item.slice(itemPrefix.length, item.length);

      itemReg = itemBody
        .split("")
        .reduce((acc, cur, _i) => {
          if (_i === 0) {
            return [cur];
          }
          return [...acc, acc[acc.length - 1] + cur];
        }, [])
        .filter((it) => it.length >= 2)
        .map((it) => itemPrefix + it)
        .reverse()
        .join("|");
    }

    /*
    if (item === "功能性關關的交流電源電壓") {
      console.log("itemReg: ", itemReg);
      debugger;
    }
    */

    let longestMatch = "";
    let isFind = false;
    allModeForInventionParagraphDetails.forEach(
      ({ content, paragraphMatch }) => {
        const paraMatches = [...content.matchAll(itemReg, "g")];

        if (paraMatches.length === 0) {
          return;
        }

        paraMatches.sort((a, b) => b[0].length - a[0].length);

        // console.log(paraMatches);
        // debugger;

        const curLongestMatch = paraMatches[0][0];

        /*
        const curLongestMatch = paraMatches
          .sort((a, b) => b[0].length - a[0].length)
          .find((match) => {
            const matchStart = match.index;
            const matchEnd = match.index + match[0].length;

            const isIntersectWithOldMatch = [
              ...paragraphMatch.corrects
              // ...paragraphMatch.wrongs,
              // ...paragraphMatch.potentialErrors
            ].some((me) => !(me.start >= matchEnd || me.end <= matchStart));

            if (isIntersectWithOldMatch) {
              return false;
            }
            return true;
          })[0];
          */

        // longestMatch =
        //   curLongestMatch && curLongestMatch.length > longestMatch
        //     ? curLongestMatch
        //     : longestMatch;
        if (curLongestMatch && curLongestMatch.length > longestMatch.length) {
          longestMatch = curLongestMatch;
          isFind = true;
        }
      }
    );

    // Test
    // if (longestMatch !== "")
    //   console.log(
    //     `沒在符號說明但在實施方式有的元件: 原本叫做: ${item}, 後來變成: ${longestMatch}`
    //   );
    // Test
    return { item: longestMatch === "" ? item : longestMatch, isFind };
  } catch (error) {
    return { item, isFind: false };
  }
};

export const checkWrongElementInModeForInvention = (
  item,
  allModeForInventionParagraphDetails
) => {
  try {
    /*
    if (item === "功能性關關的交流電源電壓，當有偵測到") {
      console.log("item: ", item);
      debugger;
    }
    */

    let longestMatch = "";
    let isFind = false;
    allModeForInventionParagraphDetails.forEach(({ paragraphMatch }) => {
      if (!paragraphMatch.wrongs) return;

      const paraWrongMatches = paragraphMatch.wrongs.filter((wrong) =>
        item.startsWith(wrong.item)
      );

      if (paraWrongMatches.length === 0) {
        return;
      }

      paraWrongMatches.sort((a, b) => b.item.length - a.item.length);

      console.log(paraWrongMatches);

      const curLongestMatch = paraWrongMatches[0].item;

      // console.log("curLongestMatch: ", curLongestMatch);
      // debugger;

      if (curLongestMatch && curLongestMatch.length > longestMatch.length) {
        longestMatch = curLongestMatch;
        isFind = true;
      }
    });

    // Test
    // if (longestMatch !== "")
    //   console.log(
    //     `沒在符號說明但在實施方式有的元件: 原本叫做: ${item}, 後來變成: ${longestMatch}`
    //   );
    // Test
    return { item: longestMatch === "" ? item : longestMatch, isFind };
  } catch (error) {
    return { item, isFind: false };
  }
};
