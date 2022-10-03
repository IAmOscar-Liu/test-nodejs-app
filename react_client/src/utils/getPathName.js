export const getPathName = () => {
  const url = window.location.href;

  return url.slice(url.lastIndexOf("/") + 1);
};
