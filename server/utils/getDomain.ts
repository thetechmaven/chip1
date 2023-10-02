const getDomain = () => {
  if (typeof window !== 'undefined') {
    const currentProtocol = window.location.protocol;
    const currentDomain = window.location.hostname;
    return currentProtocol + '//' + currentDomain;
  } else {
    return process.env.APP_URL as string;
  }
};

export default getDomain;
