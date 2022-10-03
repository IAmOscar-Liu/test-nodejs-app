import { checkCoOperatingClaim, checkParentClaim } from "./checkAttachClaim";

export const checkClaim = (prevClaims, content, index) => {
  // index is the num of claims -> claim 1 -> index = 1
  let type;
  let attemptAttaches = [];
  let attaches = [];
  let errors = [];

  // 未以單句為之
  if (!/。$/.test(content)) {
    errors.push({
      message: `請求項未以單句為之(無句號)`,
      start: -200,
      end: -199
    });
  }
  if (content.indexOf("。") !== content.length - 1) {
    [...content.matchAll(/。/g)].forEach((mm) => {
      if (mm.index !== content.length - 1) {
        errors.push({
          message: `請求項未以單句為之(句號在句中)`,
          errorContent: "。",
          start: mm.index,
          end: mm.index + 1
        });
      }
    });
  }

  if (/^一種?/.test(content)) {
    // 獨立項
    type = "independent";
    const CoOperatingClaimCheck = checkCoOperatingClaim(
      content,
      prevClaims,
      index
    );
    attemptAttaches = CoOperatingClaimCheck.attemptAttaches;
    attaches = CoOperatingClaimCheck.attaches;
    if (!/^一種/.test(content)) {
      errors.push({
        message: `獨立項未以「一種」開頭`,
        errorContent: content[0],
        start: -154,
        end: -155
      });
    }
    errors = [...CoOperatingClaimCheck.errors, ...errors];

    /**
     *  Test
     */
    // if (attaches.length > 0 || attemptAttaches.length > 0) {
    //   console.log("請求項" + index);
    //   console.log(content);
    //   console.log("attaches", attaches);
    //   console.log("attemptAttaches", attemptAttaches);
    //   debugger;
    // }
  } else {
    // 附屬項或者無法判斷
    try {
      type = "additional";
      const claimCheck = checkParentClaim(content, prevClaims, index);
      attemptAttaches = claimCheck.attemptAttaches;
      attaches = claimCheck.attaches;
      if (!/^(依據|根據|如|依)/.test(content)) {
        errors.push({
          message: `附屬項未以「如」、「依據」或「根據」等用語開頭`,
          errorContent: content[0],
          start: -154,
          end: -155
        });
      }
      errors = [...claimCheck.errors, ...errors];
    } catch (err) {
      console.log(`claim ${index} unable to analyze: ${err.message}`);
      console.log(err);
      type = "unknown";
      attemptAttaches = [];
      attaches = [];
      errors = [
        {
          message: err.message,
          start: -100,
          end: -99
        }
      ];
    }
  }

  return {
    type,
    content,
    attemptAttaches,
    attaches,
    errors
  };
};
