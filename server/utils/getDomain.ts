const getDomain = () => {
  const currentProtocol = window.location.protocol;
  const currentDomain = window.location.hostname;
  return currentProtocol + '//' + currentDomain;
};

export default getDomain;
