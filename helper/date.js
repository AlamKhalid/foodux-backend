// this function appends zeros to the right of numbers < 10
appendZero = (i) => {
  if (i < 10) return `0${i}`;
  return i;
};

// returns the time in hh:mm:ss format
getTime = () => {
  let today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = appendZero(m);
  s = appendZero(s);
  return `${h}:${m}:${s}`;
};

// returns the date in dd-mm-yyyy format
getDate = () => {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0

  let yyyy = today.getFullYear();
  dd = appendZero(dd);
  mm = appendZero(mm);
  today = `${dd}/${mm}/${yyyy}`;
  return today;
};

getJoinedDate = () => {
  const today = new Date();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "Novmeber",
    " December",
  ];
  const mm = today.getMonth(); //January is 0
  const year = today.getFullYear();
  return `${months[mm]} ${year}`;
};

module.exports = {
  getDate: getDate,
  getJoinedDate: getJoinedDate,
  getTime: getTime,
};
