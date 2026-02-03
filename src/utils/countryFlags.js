const countryCodeToFlag = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return "";
  return `fi fi-${countryCode.toLowerCase()}`;
};
export default countryCodeToFlag;
