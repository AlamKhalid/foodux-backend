appendZero = i => {
  if (i < 10) return `0${i}`;
  return i;
};

getTime = () => {
  let today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = appendZero(m);
  s = appendZero(s);
  return `${h}:${m}:${s}`;
};

getDate = () => {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0

  let yyyy = today.getFullYear();
  dd = appendZero(dd);
  mm = appendZero(mm);
  today = `${dd}-${mm}-${yyyy}`;
  return today;
};

module.exports = {
  getDate: getDate,
  getTime: getTime
};
