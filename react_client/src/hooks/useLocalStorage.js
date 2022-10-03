import { useState, useEffect } from "react";

const KEY = "automatic-patent-examiner";

const useLocalStorage = (initialValue) => {
  const getLocalStorage = () => {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      console.log(`Unable to get localstorage: ${e.message}`);
      return null;
    }
  };

  const setLocalStorage = (value) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch (e) {
      console.log(`Unable to set localstorage: ${e.message}`);
    }
  };

  const [value, setValue] = useState(() => {
    const jsonValue = getLocalStorage();
    if (jsonValue !== null) return JSON.parse(jsonValue);
    if (typeof initialValue === "function") {
      return initialValue();
    } else {
      return initialValue;
    }
  });

  useEffect(() => {
    setLocalStorage(value);
  }, [value, setValue]);

  return [value, setValue];
};

export default useLocalStorage;
