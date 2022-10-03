import { stringToUnicode } from "./stringToUnicode";

const fetchResultFromDB = async (followContentMap) => {
  try {
    const res = await fetch(process.env.REACT_APP_SERVER_URL, {
      method: "POST",
      body: JSON.stringify({ followContents: Object.keys(followContentMap) }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });

    const json = await res.json();

    return json.dbResultMap || {};
  } catch (error) {
    window.alert(
      "無法連線到資料庫，請檢查您的網路連線，且不要再本機上使用此功能"
    );
    return {};
  }
};

export const lookupDB = async (claims, useDatabase, _dbResultMap) => {
  const followContentMap = {};

  for (let claimIdx = 0; claimIdx < claims.length; claimIdx++) {
    // m.isInDescriptionOfElementMap === false && !m.shouldLookupDB
    for (
      let matchIdx = 0;
      matchIdx < claims[claimIdx].matches.length;
      matchIdx++
    ) {
      const match = claims[claimIdx].matches[matchIdx];

      if (match.isInDescriptionOfElementMap) continue;
      if (match.isInDescriptionOfElementMap === false && !match.shouldLookupDB)
        continue;
      if (
        match.isInDescriptionOfElementMap === false &&
        match.shouldLookupDB &&
        !useDatabase
      ) {
        match.shouldLookupDB = false;
        continue;
      }
      if (!match.followContent) continue;

      if (followContentMap[match.followContent] === undefined) {
        followContentMap[match.followContent] = {
          addresses: [{ claimIdx, matchIdx }]
        };
      } else {
        followContentMap[match.followContent].addresses.push({
          claimIdx,
          matchIdx
        });
      }
    }
  }

  if (Object.keys(followContentMap).length === 0) return;

  const dbResultMap = await fetchResultFromDB(followContentMap);

  // console.log("followContentMap", followContentMap);
  // console.log("dbResultMap", dbResultMap);

  Object.entries(followContentMap).forEach(([key, value]) => {
    const dbValue = dbResultMap[key];
    _dbResultMap[key] = { dbValue: dbValue || "無結果", claims: new Set() };

    for (let address of value.addresses) {
      const { claimIdx, matchIdx } = address;
      _dbResultMap[key].claims.add(claimIdx + 1);

      if (dbValue) {
        claims[claimIdx].matches[matchIdx].group = stringToUnicode(dbValue);
        claims[claimIdx].matches[matchIdx].item = dbValue;
        claims[claimIdx].matches[matchIdx].value = dbValue;
        claims[claimIdx].matches[matchIdx].end =
          claims[claimIdx].matches[matchIdx].start + dbValue.length;
      } else {
        claims[claimIdx].matches[matchIdx].shouldLookupDB = false;
      }
    }

    _dbResultMap[key].claims = Array.from(_dbResultMap[key].claims).sort(
      (a, b) => a - b
    );
  });

  console.log("dbResultMap", _dbResultMap);

  // debugger;

  /*
      group: stringToUnicode(optimalValue),
      item: optimalValue,
      value: optimalValue,
      end: mm.start + optimalValue.length
  */
};

export const optimizeClaimMatch = (claims) => {
  const claimGroup = [];
  const groupMatchesSortedByLength = [];

  // console.log(claims[9]);
  // debugger;
  /*
  console.log(
    claims[9].matches.filter(
      (m) =>
        m.isInDescriptionOfElementMap === false &&
        !RegExp(
          `^第[一二三四五六七八九十]|${symetricPrefix().split("").join("|")}`
        ).test(m.item)
    )
  );
  debugger;
  */

  //  shouldLookupDB, followContent,

  claims.forEach((claim, claimIdx) => {
    if (
      claimIdx === 0 ||
      claim.type === "independent" ||
      claim.type === "unknown"
    ) {
      claimGroup.push({
        baseClaimIdx: claimIdx,
        groupMatches: claim.matches.filter(
          (m) => m.isInDescriptionOfElementMap === false && !m.shouldLookupDB
        )
      });
    } else {
      claimGroup[claimGroup.length - 1].groupMatches.push(
        ...claim.matches.filter(
          (m) => m.isInDescriptionOfElementMap === false && !m.shouldLookupDB
        )
      );
    }
  });

  claimGroup.forEach((cg) => {
    groupMatchesSortedByLength.push({
      baseClaimIdx: cg.baseClaimIdx,
      // groupMatches: [...cg.groupMatches].sort(
      //   (a, b) => a.value.length - b.value.length
      // ),
      valueTable: buildMatchValueTable(
        [...cg.groupMatches].sort((a, b) => a.value.length - b.value.length)
      )
    });
  });

  groupMatchesSortedByLength.forEach(({ baseClaimIdx, valueTable }, index) => {
    // console.log(valueTable);
    // console.log([...Object.keys(valueTable)].sort((a, b) => a.localeCompare(b)));
    // debugger;

    const valueSortedByName = [...Object.keys(valueTable)].sort((a, b) =>
      a.localeCompare(b)
    );

    valueSortedByName.forEach((value, valueIdx) => {
      if (
        valueIdx === 0 &&
        !valueSortedByName.slice(0, valueIdx).find((pv) => value.startsWith(pv))
      ) {
        return;
      }

      if (
        valueTable[value].possibiles.length > 0 &&
        (valueTable[value].possibiles.length === 1 ||
          valueTable[valueTable[value].possibiles[0]].sum >
            valueTable[valueTable[value].possibiles[1]].sum)
      ) {
        /*
          假設 「網路模組連接」的 possibles 有「網路模組」3次(possibles[0]),「網路」2次(possibles[1])
          possibles[0].sum(「網路模組」3次) > possibles[1].sum(「網路」2次) 
          所以「網路模組連接」改成「網路模組」
        */

        const claimNumStart = baseClaimIdx + 1;
        const claimNumEnd = groupMatchesSortedByLength[index + 1]
          ? groupMatchesSortedByLength[index + 1].baseClaimIdx
          : claims.length;
        const optimalValue = valueTable[value].possibiles[0];

        console.log(
          `claim ${claimNumStart}~${claimNumEnd} 的 ${value} 變成 ${optimalValue}`
        );
        // debugger;

        claims.forEach((claim) => {
          if (claim.num >= claimNumStart && claim.num <= claimNumEnd) {
            claim.matches = claim.matches.map((mm) => {
              if (
                mm.isInDescriptionOfElementMap === false &&
                !mm.shouldLookupDB &&
                mm.value === value
              ) {
                return {
                  ...mm,
                  group: stringToUnicode(optimalValue),
                  item: optimalValue,
                  value: optimalValue,
                  end: mm.start + optimalValue.length
                };
              }
              return mm;
            });
          }
        });
      }
    });

    // Test
    // console.log(claimGroup);
    // console.log(groupMatchesSortedByLength);
    // console.log(valueTable);
    // console.log(valueSortedByName);
    // debugger;
  });

  // Test
  // console.log(claims[9].matches);
  // debugger;
};

function buildMatchValueTable(groupMatches) {
  const valueTable = {};
  groupMatches.forEach((match) => {
    if (valueTable[match.value]) {
      valueTable[match.value].sum++;
    } else {
      valueTable[match.value] = {
        sum: 1,
        possibiles: [...Object.keys(valueTable).reverse()].filter((preValue) =>
          match.value.startsWith(preValue)
        )
      };
    }
  });

  return valueTable;
}
