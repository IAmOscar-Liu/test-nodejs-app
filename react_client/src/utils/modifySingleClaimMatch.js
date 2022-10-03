import { stringToUnicode } from "./stringToUnicode";
import { checkClaimMatch } from "./checkClaimMatch";
import { getAllAttachedClaims, getAllClaimPaths } from "./checkAttachClaim";
import { allThisWords } from "../dict/allThisWords";
import { pickColor } from "../dict/elementColors";
import { isMainElementValid } from "./isMainElementValid";
import { getMapValues } from "./otherUtils";

export const modifySingleClaimMatch = (
  index,
  regExpsOrigin,
  concatRegExp,
  concatSymRegExp,
  regExpWithWrongChar,
  claims,
  claim,
  descriptionOfElementMap,
  figureOfDrawingsMap,
  elementColorMap,
  allModeForInventionParagraphDetails,
  manuallyAddValues,
  utilityModelTitle,
  applicationNum
) => {
  // console.log(`
  //   <hr/>
  //   <p>Claim ${index + 1}</p>
  // `);
  claim.matches =
    claim.matches && claim.matches.length > 0 ? claim.matches : [];
  claim.nonMatches = [];
  claim.usedElements = [];
  claim.matchedClaimsNum = [];

  let contentFirstIndex;

  try {
    if (claim.matches[0]) {
      claim.mainElement = claim.matches[0].value.replace(/[↵\n]/g, "").trim();
    } else if (claim.type === "independent") {
      const myMainElement = claim.content
        .split(/[:，;。]/)[0]
        .match(
          /^一種?(如(申請專利範圍請求項|申請專利範圍|權利要求|請求項).*?(所述之|所述的|所述|之|的))?(.*)/
        );

      if (myMainElement) {
        claim.mainElement = myMainElement[4]
          .split(
            /任意一項之|任意一項的|任意一項|任意1項之|任意1項的|任意1項|任一項之|任一項的|任一項|任1項之|任1項的|任1項|任意之|任意的|任意|任一之|任一的|任一|任1之|任1的|任1|所述之|所述的|所述/
          )
          .pop()
          .split(RegExp(`${allThisWords()}`))[0]
          .replace(/[↵\n]/g, "")
          .trim();
      } else {
        throw Error("無法判斷此請求項為獨立項或附屬項");
      }
    } else if (claim.type === "additional") {
      let myMainElement = claim.content
        .split(/[:，;。]/)[0]
        .match(
          /(.*(申請專利範圍請求項|申請專利範圍|權利要求|請求項).+?(所述之|所述的|所述|之|的))(.*)/
        );

      if (!myMainElement) {
        myMainElement = claim.content
          .split(/[:，;。]/)[0]
          .match(
            /(.*(申請專利範圍請求項|申請專利範圍|權利要求|請求項).*?([0-9]+項?))(.*)/
          );
      }

      if (myMainElement) {
        // Test
        // if (claim.num === 7) {
        //   console.log(myMainElement);
        //   debugger;
        // }
        // myMainElement = myMainElement.split(/任意一項|任意1項|任一項|任1項|任意|任一|任1|所述之|所述的|所述/).pop()
        claim.mainElement = myMainElement[4]
          .split(
            /任意一項之|任意一項的|任意一項|任意1項之|任意1項的|任意1項|任一項之|任一項的|任一項|任1項之|任1項的|任1項|任意之|任意的|任意|任一之|任一的|任一|任1之|任1的|任1|所述之|所述的|所述/
          )
          .pop()
          .split(RegExp(`${allThisWords()}`))[0]
          .replace(/[↵\n]/g, "")
          .trim();

        if (/^(一種|一)/.test(claim.mainElement)) {
          claim.mainElement = claim.mainElement.slice(
            claim.mainElement.match(/^(一種|一)/)[1].length
          );
        }
      } else {
        throw Error("無法判斷此請求項為獨立項或附屬項");
      }
    } else {
      // claim.type === 'unknown'
      return;
      // throw Error("無法判斷此請求項為獨立項或附屬項");
    } // if: find claim.mainElement

    if (claim.mainElement) {
      const matchIndex = regExpsOrigin
        .map((o) => o.value)
        .indexOf(claim.mainElement);
      if (
        matchIndex < 0 &&
        !elementColorMap[stringToUnicode(claim.mainElement)]
      ) {
        elementColorMap[stringToUnicode(claim.mainElement)] = {
          value: claim.mainElement,
          // color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
          //   Math.random() * 255
          // )}, ${Math.floor(Math.random() * 255)}, .7)`
          color: pickColor(Object.keys(elementColorMap).length)
        };
      }
      claim.matches[0] = {
        group: stringToUnicode(
          (matchIndex >= 0 &&
            getMapValues(
              descriptionOfElementMap,
              figureOfDrawingsMap,
              regExpsOrigin[matchIndex]
            )?.values[0]) ||
            claim.mainElement
        ),
        // descriptionOfElementMap[regExpsOrigin[matchIndex].key]
        // ? stringToUnicode(
        //     descriptionOfElementMap[regExpsOrigin[matchIndex].key].values[0]
        //   )
        // : stringToUnicode(claim.mainElement),
        value: claim.mainElement,
        item:
          (matchIndex >= 0 &&
            getMapValues(
              descriptionOfElementMap,
              figureOfDrawingsMap,
              regExpsOrigin[matchIndex]
            )?.values[0]) ||
          claim.mainElement,
        //  matchIndex >= 0 &&
        //  descriptionOfElementMap[regExpsOrigin[matchIndex].key]
        //    ? descriptionOfElementMap[regExpsOrigin[matchIndex].key].values[0]
        //    : claim.mainElement,
        start: claim.content.indexOf(claim.mainElement),
        end:
          claim.content.indexOf(claim.mainElement) + claim.mainElement.length,
        // pathIsOK: claim.type === "independent" ? true : false,
        isMainElement: true
      };
      // applicationNum[3] !== "1" &&
      if (claim.type === "independent") {
        isMainElementValid(claim, utilityModelTitle, applicationNum);
      }
    }

    // if (index === 16) {
    //   console.log(claim);
    //    console.log(regExpsOrigin);
    //    debugger;
    // }

    claim.matchedClaimsNum = getAllAttachedClaims(claims, [], claim).map(
      (c) => c.num
    );

    claim.claimSearchPath = getAllClaimPaths(claims, claim);

    // Test
    // console.log("claim num: ", claim.num);
    /*
    if (index === 1) {
      console.log("claim.mainElement: ", claim.mainElement);
      console.log("claim.content: ", claim.content);

      console.log(
        "contentFirstIndex",
        claim.content.split(/[:，;。]/)[0].length
      );
      console.log(
        "remain content",
        claim.content.slice(claim.content.split(/[:，;。]/)[0].length)
      );

      debugger;
    }
    */
    /*
    contentFirstIndex = claim.content.slice(
      0,
      claim.content.match(
        RegExp(claim.mainElement.split(/[^\u4E00-\u9FFF]/)[0])
      ).index + claim.mainElement.length
    ).length;
    */
    contentFirstIndex = claim.content.split(/[:，;。]/)[0].length;

    if (claim.matches.length === 1) {
      claim.matches = [
        ...claim.matches,
        ...checkClaimMatch(
          claims,
          claim,
          regExpsOrigin,
          concatRegExp,
          concatSymRegExp,
          claim.mainElement,
          regExpWithWrongChar,
          // claim.content.slice(claim.content.match(/[:，;]/).index),
          claim.content.slice(
            // claim.content.match(
            //   RegExp(claim.mainElement.split(/[^\u4E00-\u9FFF]/)[0])
            // ).index + claim.mainElement.length
            contentFirstIndex
          ),
          // claim.content.split(/[:，;]/)[0].length,
          contentFirstIndex,
          descriptionOfElementMap,
          figureOfDrawingsMap,
          allModeForInventionParagraphDetails,
          manuallyAddValues
        )
      ].map((mt, indexOfMatch) => ({ ...mt, indexOfMatch }));
    } // if: find all claim.matches

    claim.matches = claim.matches.map((mm, mIdx) => ({
      ...mm,
      isOK: true,
      pathIsOK: claim.type === "independent" && mIdx === 0 ? true : false,
      hasBeenModified: false, // 是否被 user 改過過
      multiPathTestMatches: null,
      prevMatchedElement: null,
      prevMatchPerPath: [],
      longestPrevMatch: "",
      preserveValue: false // 是不被　user 要求 preserveValue
    }));
    // Test
    // console.log(claim.matches);
    // debugger;
    // claim.claim.multiPathTestMatches = [...claim.matches];
  } catch (err) {
    console.log(err);
    claim.errors.push({
      message: err.message.includes("無法判斷此請求項為獨立項或附屬項")
        ? "無法判斷此請求項為獨立項或附屬項"
        : `分析此請求項時發生問題: ${err.message}`,
      start: -100,
      end: -99
    });
  } finally {
    return contentFirstIndex;
  }
};
