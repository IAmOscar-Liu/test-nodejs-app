import React, { useState } from "react";

const SearchPopup = ({ handleClose, searchString, setSearchString }) => {
  const [tmpSearchString, setTmpSearchString] = useState(searchString);

  return (
    <div className="search-popup">
      <h4>搜尋元件名稱</h4>
      <section>
        <input
          type="text"
          placeholder="輸入你要搜尋的元件......"
          value={tmpSearchString}
          onChange={(e) => setTmpSearchString(e.target.value.trim())}
        />
        <button
          onClick={() => {
            setSearchString(tmpSearchString);
            handleClose(false);
          }}
        >
          送出
        </button>
      </section>
      <div>
        <button
          onClick={() => {
            setTmpSearchString("");
            setSearchString("");
            handleClose(false);
          }}
        >
          清除搜尋結果
        </button>
        <button onClick={() => handleClose(false)}>取消</button>
      </div>
    </div>
  );
};

export default SearchPopup;

/*
    personalSettings: {
      fontSize: 2
    }
*/
