import { checkIllegalAttach } from "./checkIllegalAttach";

export const modifySingleClaim = (
  index,
  regExpsOrigin,
  concatRegExp,
  concatSymRegExp,
  claims,
  claim,
  descriptionOfElementMap,
  figureOfDrawingsMap,
  elementColorMap,
  contentFirstIndex
) => {
  try {
    if (!claim.claimSearchPath) return;
    else if (claim.claimSearchPath.length <= 1) {
      // 只有一條路徑，直接檢查

      checkIllegalAttach(
        regExpsOrigin,
        concatRegExp,
        concatSymRegExp,
        contentFirstIndex,
        claims,
        claim,
        descriptionOfElementMap,
        figureOfDrawingsMap,
        elementColorMap,
        claim.claimSearchPath[0],
        true, // isFirstPath
        false, // 固定不在符號說明的該 item
        false // isTestMode
      );

      claim.matches = claim.matches.map((mm) => ({
        ...mm,
        isOK: mm.pathIsOK,
        prevMatchPerPath: [mm.prevMatchedElement]
      }));
      // Test
      // console.log(`claim ${claim.num} matches`);
      // console.log(claim.matches);
      // console.log(claim.matches.map((m) => m.isOK));
      // debugger;
      // Test
      // if (claim.num === 1) {
      //   console.log(claim.matches);
      //   debugger;
      // }
    } else {
      // 有一條路徑以上，先run test mode 確認不在「該」的 item 長度
      // run testmode

      // Test
      // console.log(`claim ${claim.num} before test mode`);
      // console.log(claim.matches);
      // console.log(claim.usedElements);

      checkIllegalAttach(
        regExpsOrigin,
        concatRegExp,
        concatSymRegExp,
        contentFirstIndex,
        claims,
        claim,
        descriptionOfElementMap,
        figureOfDrawingsMap,
        elementColorMap,
        claim.matchedClaimsNum,
        true, // isFirstPath
        false, // 固定不在符號說明的該 item
        true // isTestMode
      );

      // Test
      // console.log(`claim ${claim.num} after test mode`);
      // console.log(claim.matches);
      // console.log(claim.usedElements);
      // debugger;

      // 把 test mode 的 result 記下來, 方便 debug 用
      claim.multiPathTestMatches = [...claim.matches];
      // 記住 test Mode 的 item, 之後每條的 path 不在「該」的 item 固定
      claim.matches = claim.matches.map((match, mIdx) => {
        return {
          ...claim.matches[mIdx],
          pathIsOK: claim.type === "independent" && mIdx === 0 ? true : false,
          item: match.item,
          prevMatchedElement: null
        };
      });
      const multiPathAfterInit = [...claim.matches];

      // Test
      // console.log(`claim ${claim.num} after init`);
      // console.log(claim.matches);
      // debugger;

      // 檢查是否不當依附, 每條路徑檢查一次
      claim.claimSearchPath.forEach((path, pathIdx) => {
        checkIllegalAttach(
          regExpsOrigin,
          concatRegExp,
          concatSymRegExp,
          contentFirstIndex,
          claims,
          claim,
          descriptionOfElementMap,
          figureOfDrawingsMap,
          elementColorMap,
          path,
          false, // isFirstPath
          true, // 固定不在符號說明的該 item
          false // isTestMode
        );

        // Test
        // console.log("path: ", path);
        // console.log(`claim ${claim.num} match after path 1: `);
        // console.log(claim.matches);
        // debugger;

        // 有一條路徑失敗 -> 該元件失敗
        claim.matches = claim.matches.map((match, mIdx) => {
          return {
            ...multiPathAfterInit[mIdx],
            isOK: !match.pathIsOK ? false : match.isOK,
            // item: match.item,
            /*prevMatchedElement:
              claim.claimSearchPath.length - 1 === pathIdx
                ? match.prevMatchedElement
                : null*/
            prevMatchPerPath: [
              ...match.prevMatchPerPath,
              match.prevMatchedElement
            ],
            prevMatchedElement: null
          };
        }); // each match
      }); // each path

      // Test
      console.log(`claim ${claim.num} details after all paths`);
      console.log(claim);
      // debugger;
    } // else
  } catch (err) {
    console.log(err);
    claim.errors.push({
      message: err.message.includes("無法判斷此請求項為獨立項或附屬項")
        ? "無法判斷此請求項為獨立項或附屬項"
        : `分析此請求項時發生問題: ${err.message}`,
      start: -100,
      end: -99
    });
  }
};
