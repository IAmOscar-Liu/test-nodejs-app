import {
  claimStartReg,
  getAllClaims,
  shouldClaimUseAny
} from "../dict/claimReg";
import { getKeyInRange } from "./otherUtils";

export const checkCoOperatingClaim = (originalContent, prevClaims, index) => {
  let attaches = [];
  let attemptAttaches = [];
  let errors = [];

  try {
    if (
      !originalContent.match(
        /^.+?(配合|包含|包括|具有|俱有|依據|依照|為|如|與|依)(申請專利範圍請求項|申請專利範圍|權利要求|請求項)/
      )
    )
      return {
        attaches,
        attemptAttaches,
        errors
      };

    // 如果有引用記載
    // 統一把開頭的「如」，「依據」去掉
    const coOpMatch = originalContent.match(
      /(配合|包含|包括|具有|俱有|依據|依照|為|如|與|依)(申請專利範圍請求項|申請專利範圍|權利要求|請求項)/
    );
    const content = originalContent.slice(
      coOpMatch.index + coOpMatch[1].length
    );

    // console.log("有引用記載");
    // console.log(originalContent);
    // console.log(content);
    // debugger;

    const contentStart = content.split(/[:，;。]/)[0];

    const claimMatchString = contentStart.match(claimStartReg)?.[0];

    // console.log(claimMatchString);
    // debugger;

    if (!claimMatchString)
      return {
        attaches,
        attemptAttaches,
        errors
      };

    const claimRanges = getAllClaims(claimMatchString);

    // 未以選擇式為之
    if (
      shouldClaimUseAny(claimMatchString, claimRanges) &&
      !contentStart.slice(claimMatchString.length).match(/任意?一項/)
    ) {
      errors.unshift({
        message: `引用記載型式未以選擇式為之`,
        errorContent: claimMatchString,
        start: -1000,
        end: -999
      });
    }

    // 使用大陸用語:權利要求
    if (/申請專利範圍請求項|權利要求/.test(claimMatchString)) {
      const errMatch = contentStart.match(/申請專利範圍請求項|權利要求/);

      // console.log(errMatch);
      // debugger;

      errors.unshift({
        message: `獨立項之引用記載形式「……${contentStart.slice(
          0,
          errMatch.index + errMatch[0].length
        )}……」，不符合獨立項之引用記載形式`,
        errorContent: errMatch[0],
        start: -1000,
        end: -999
      });
    }

    attaches = claimRanges
      .reduce((accKeys, curKey) => {
        if (/.+[-~～到至].+/.test(curKey)) {
          return [...accKeys, ...getKeyInRange(curKey)];
        }
        return [...accKeys, curKey];
      }, [])
      .map((a) => parseInt(a));

    if (attaches.find((a) => !a))
      return {
        attaches,
        attemptAttaches,
        errors
      };

    attemptAttaches = attaches.slice();

    /*if (
      content.match(
        /如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?[至到~-](申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?.*?(其中|任意|任)[1一]項?/
      )
    ) {
      // `如請求項1至10，其中1項之電連接器之鎖扣結構，其中...`
      const result = content.match(
        /如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?[至到~-](申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?.*?(其中|任意|任)[1一]項?/
      );
      let _attaches = [];
      let _attemptAttaches = [];
      for (let i = parseInt(result[2]); i <= parseInt(result[4]); i++) {
        _attaches.push(i);
        _attemptAttaches.push(i);
      }
      attaches = [...attaches, ..._attaches];
      attemptAttaches = [...attemptAttaches, ..._attemptAttaches];
    }

    if (
      content.match(
        /如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?(([，、或](申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?)+)[，、或]?或(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
      )
    ) {
      // `如請求項1，2或請求項3之電連接器之鎖扣結構，其中...`
      const result = content.match(
        /如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?(([，、或](申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?)+)[，、或]?或(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
      );
      let _attaches = [parseInt(result[2])];
      _attaches = [
        ..._attaches,
        ...result[3]
          .replace(/[，、或]/, "")
          .split(/[，、或]/)
          .map((el) => parseInt(el.match(/[0-9]+/)[0]))
      ];
      _attaches = [..._attaches, parseInt(result[8])];
      let _attemptAttaches = _attaches.slice();
      attaches = [...attaches, ..._attaches];
      attemptAttaches = [...attemptAttaches, ..._attemptAttaches];
    }

    if (
      content.match(
        /如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?或(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
      )
    ) {
      // `如請求項1或請求項2之電連接器之鎖扣結構，其中...`
      const result = content.match(
        /如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?或(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
      );
      const _attaches = [parseInt(result[2]), parseInt(result[4])];
      const _attemptAttaches = _attaches.slice();
      attaches = [...attaches, ..._attaches];
      attemptAttaches = [...attemptAttaches, ..._attemptAttaches];
    }

    if (
      attemptAttaches.length === 0 &&
      attaches.length === 0 &&
      content.match(
        /如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?[至到~-](申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
      )
    ) {
      // 如請求項1至2所述之鎖扣結構，其中 -> 未以選擇式為之
      const result = content.match(
        /如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?(至|到|~|-)(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
      );

      if (!errors.find((er) => er.message === `引用記載型式未以選擇式為之`)) {
        errors.unshift({
          message: `引用記載型式未以選擇式為之`,
          errorContent: result[0].slice(1),
          start: -1000,
          end: -999
        });
      }

      let _attaches = [];
      let _attemptAttaches = [];
      for (let i = parseInt(result[2]); i <= parseInt(result[5]); i++) {
        _attaches.push(i);
        _attemptAttaches.push(i);
      }
      attaches = [...attaches, ..._attaches];
      attemptAttaches = [...attemptAttaches, ..._attemptAttaches];
    } else if (
      content.match(
        /如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?/
      )
    ) {
      const _attaches = [
        parseInt(
          content.match(
            /如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?/
          )[2]
        )
      ];
      const _attemptAttaches = _attaches.slice();
      attaches = [...attaches, ..._attaches];
      attemptAttaches = [...attemptAttaches, ..._attemptAttaches];
    }

    if (attemptAttaches.length === 0 && attaches.length === 0) {
      return { attemptAttaches: [], attaches: [], errors };
    } else {
      attemptAttaches = attemptAttaches
        .reduce((a, e) => {
          if (!a.includes(e)) {
            return [...a, e];
          }
          return a;
        }, [])
        .sort((a, b) => a - b);
      attaches = attaches
        .reduce((a, e) => {
          if (!a.includes(e)) {
            return [...a, e];
          }
          return a;
        }, [])
        .sort((a, b) => a - b);
    }*/

    for (let i = attaches.length - 1; i >= 0; i--) {
      // 檢查依附的請求項是否存在
      if (!prevClaims.some((claim) => claim.num === parseInt(attaches[i]))) {
        const start = content.match(RegExp(attaches[i]))
          ? content.match(RegExp(attaches[i])).index
          : -100;
        errors.unshift({
          message:
            attaches[i] === index
              ? `引用記載之請求項${attaches[i]}即為本身，不可依附自己`
              : `引用記載之請求項${attaches[i]}不在該請求項之前或不存在`,
          start,
          end: start + (attaches[i] + "").toString().length
        });
        attaches.splice(i, 1);
        continue;
      }

      // 檢查依附的請求項是否無法分析
      if (prevClaims[parseInt(attaches[i]) - 1].type === "unknown") {
        errors.unshift({
          message: `引用記載之請求項${attaches[i]}目前無法分析，先暫且跳過`,
          start: -100,
          end: -99
        });
        attaches.splice(i, 1);
      }
    }

    return {
      attemptAttaches,
      attaches,
      errors
    };
  } catch (e) {
    return {
      attemptAttaches: [],
      attaches: [],
      errors: []
    };
  }
};

export const checkParentClaim = (originalContent, prevClaims, index) => {
  let attaches;
  let attemptAttaches;
  let errors = [];

  try {
    if (
      !originalContent.match(
        /^(.*?)(申請專利範圍請求項|申請專利範圍|權利要求|請求項)/
      )
    )
      throw Error("無法判斷此請求項為獨立項或附屬項");

    // 統一把開頭的「如」，「依據」去掉
    const content = originalContent.slice(
      originalContent.match(
        /^(.*?)(申請專利範圍請求項|申請專利範圍|權利要求|請求項)/
      )[1].length
    );

    const contentStart = content.split(/[:，;]/)[0];

    const claimMatchString = contentStart.match(claimStartReg)?.[0];

    // console.log(claimMatchString);
    // debugger;

    if (!claimMatchString) throw Error("無法判斷此請求項為獨立項或附屬項");

    const claimRanges = getAllClaims(claimMatchString);

    // 未以選擇式為之
    if (
      shouldClaimUseAny(claimMatchString, claimRanges) &&
      !contentStart.slice(claimMatchString.length).match(/任意?一項/)
    ) {
      errors.unshift({
        message: `多項附屬項未以選擇式為之`,
        errorContent: claimMatchString,
        start: -1001,
        end: -1000
      });
    }

    // 未以選擇式為之
    /*
  if (
    content
      .split(/[:，;]/)[0]
      .match(
        /^(.+(申請專利範圍請求項|申請專利範圍|權利要求|請求項).+)([及和])(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?[0-9]+項?/
      )
  ) {
    const errorContent = content
      .split(/[:，;]/)[0]
      .match(
        /^(.+(申請專利範圍請求項|申請專利範圍|權利要求|請求項).+)([及和])(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?[0-9]+項?/
      )[0];
    content = content.replace(/[及和]/, "或");
    errors.unshift({
      message: `多項附屬項未以選擇式為之`,
      errorContent,
      start: -1001,
      end: -1000
    });
  }*/

    // 使用大陸用語:權利要求
    if (/申請專利範圍請求項|權利要求/.test(claimMatchString)) {
      const errMatch = originalContent.match(/申請專利範圍請求項|權利要求/);

      // console.log(errMatch);
      // debugger;

      errors.unshift({
        message: `附屬項文字開頭「${originalContent.slice(
          0,
          errMatch.index + errMatch[0].length
        )}……」，不符合附屬項之記載形式`,
        errorContent: errMatch[0],
        start: -1000,
        end: -999
      });
    }

    attaches = claimRanges
      .reduce((accKeys, curKey) => {
        if (/.+[-~～到至].+/.test(curKey)) {
          return [...accKeys, ...getKeyInRange(curKey)];
        }
        return [...accKeys, curKey];
      }, [])
      .map((a) => parseInt(a));

    if (attaches.find((a) => !a))
      throw Error("無法判斷此請求項為獨立項或附屬項");

    attemptAttaches = attaches.slice();

    /*
  if (
    content.match(
      /^如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?[至到~-](申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?.*?(其中|任意|任)[1一]項?/
    )
  ) {
    // `如請求項1至10，其中1項之電連接器之鎖扣結構，其中...`
    const result = content.match(
      /^如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?[至到~-](申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?.*?(其中|任意|任)[1一]項?/
    );
    attaches = [];
    attemptAttaches = [];
    for (let i = parseInt(result[2]); i <= parseInt(result[4]); i++) {
      attaches.push(i);
      attemptAttaches.push(i);
    }
  } else if (
    content.match(
      /^如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?(([，、或](申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?)+)[，、或]?或(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
    )
  ) {
    // `如請求項1，2或請求項3之電連接器之鎖扣結構，其中...`
    const result = content.match(
      /^如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?(([，、或](申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?)+)[，、或]?或(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
    );
    attaches = [parseInt(result[2])];
    attaches = [
      ...attaches,
      ...result[3]
        .replace(/[，、或]/, "")
        .split(/[，、或]/)
        .map((el) => parseInt(el.match(/[0-9]+/)[0]))
    ];
    attaches = [...attaches, parseInt(result[8])];
    attemptAttaches = attaches.slice();
  } else if (
    content.match(
      /^如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?或(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
    )
  ) {
    // 如請求項1或請求項2之電連接器之鎖扣結構，其中...`
    const result = content.match(
      /^如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?或(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
    );
    attaches = [parseInt(result[2]), parseInt(result[4])];
    attemptAttaches = attaches.slice();
  } else if (
    content.match(
      /^如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?[至到~-](申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
    )
  ) {
    // 如請求項1至2所述之鎖扣結構，其中 -> 未以選擇式為之
    const result = content.match(
      /^如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?(至|到|~|-)(申請專利範圍請求項|申請專利範圍|權利要求|請求項)?第?([0-9]+)項?/
    );

    if (!errors.find((er) => er.message === `多項附屬項未以選擇式為之`)) {
      errors.unshift({
        message: `多項附屬項未以選擇式為之`,
        errorContent: result[0].slice(1),
        start: -1000,
        end: -999
      });
    }

    attaches = [];
    attemptAttaches = [];
    for (let i = parseInt(result[2]); i <= parseInt(result[5]); i++) {
      attaches.push(i);
      attemptAttaches.push(i);
    }
  } else if (
    content.match(
      /^如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?/
    )
  ) {
    attaches = [
      parseInt(
        content.match(
          /^如(申請專利範圍請求項|申請專利範圍|權利要求|請求項)第?([0-9]+)項?/
        )[2]
      )
    ];
    attemptAttaches = attaches.slice();
  } else {
    throw Error("無法判斷此請求項為獨立項或附屬項");
  }*/

    for (let i = attaches.length - 1; i >= 0; i--) {
      // 檢查依附的請求項是否存在
      if (!prevClaims.some((claim) => claim.num === parseInt(attaches[i]))) {
        const start = content.match(RegExp(attaches[i]))
          ? content.match(RegExp(attaches[i])).index
          : -100;
        errors.unshift({
          message:
            attaches[i] === index
              ? `請求項${attaches[i]}即為本身，不可依附自己`
              : `請求項${attaches[i]}不在該請求項之前或不存在`,
          start,
          end: start + (attaches[i] + "").toString().length
        });
        attaches.splice(i, 1);
        continue;
      }

      // 檢查依附的請求項是否無法分析
      if (prevClaims[parseInt(attaches[i]) - 1].type === "unknown") {
        errors.unshift({
          message: `所依附的請求項${attaches[i]}目前無法分析，先暫且跳過`,
          start: -100,
          end: -99
        });
        attaches.splice(i, 1);
      }
    }

    // 檢查多附多
    /*
  if (index === 18) {
    console.log(attaches);
    console.log(content);
    debugger;
  }
  */

    if (attaches.length > 1) {
      for (let i = attaches.length - 1; i >= 0; i--) {
        /*
      if (index === 18) {
        console.log("attach", attaches[i]);
        debugger;
      }
      */

        const { result, type } = checkMultiToMulti(
          attaches[i],
          prevClaims,
          "direct"
        );

        if (result) {
          const start = content.match(RegExp(attaches[i]))
            ? content.match(RegExp(attaches[i])).index
            : -100;
          errors.unshift({
            message: `本請求項所依附之請求項${attaches[i]}為多項附屬項${
              type === "direct" ? "直接" : "間接"
            }依附多項附屬項`,
            start,
            end: start + (attaches[i] + "").toString().length
          });
          // 討論過後，決定多項附屬項直(間)接依附的請求項保留
          // attaches.splice(i, 1);
        }
      }
    }

    return {
      attemptAttaches,
      attaches,
      errors
    };
  } catch (e) {
    throw e.message;
  }
};

function checkMultiToMulti(addIndex, prevClaims, type) {
  let targetClaim = prevClaims.find((claim) => claim.num === addIndex);
  if (targetClaim.type === "independent" || targetClaim.attaches.length === 0) {
    return {
      result: false,
      type
    };
  } else if (targetClaim.attaches.length > 1) {
    return {
      result: true,
      type
    };
  } else {
    return checkMultiToMulti(targetClaim.attaches[0], prevClaims, "indirect");
  }
}

export const getAllAttachedClaims = (allClaims, attachedClaims, claim) => {
  if (claim.attaches.length === 0) {
    return attachedClaims;
  } else {
    let allAttachedClaims = [...attachedClaims];
    for (let i = 0; i < claim.attaches.length; i++) {
      // console.log("target claim: ", claim.attaches[i])
      const currentClaim = allClaims.find((c) => c.num === claim.attaches[i]);
      allAttachedClaims = [currentClaim, ...allAttachedClaims];
      const newAttachedClaim = getAllAttachedClaims(
        allClaims,
        allAttachedClaims,
        currentClaim
      );
      allAttachedClaims = [...allAttachedClaims, ...newAttachedClaim];
    }
    return allAttachedClaims
      .reduce((acc, cur) => {
        if (!acc.find((el) => el.num === cur.num)) {
          return [...acc, cur];
        }
        return acc;
      }, [])
      .sort((a, b) => b.num - a.num);
  }
};

export const getAllClaimPaths = (claims, currentClaim) => {
  if (currentClaim.attaches.length === 0) {
    return [[]];
  }

  let paths = [];
  currentClaim.attaches.forEach((attach) => {
    const newFoundPath = getAllClaimPaths(
      claims,
      claims[attach - 1]
    ).map((path) => [attach, ...path]);
    paths.push(...newFoundPath);
  });

  return paths;
};
