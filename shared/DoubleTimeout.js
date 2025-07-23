const doubleTimeout = (fun, maximum, reset) => {
  let maxTimeout = null;
  let regularTimeout = null;

  const clearTimeouts = () => {
    if (maxTimeout) {
      clearTimeout(maxTimeout);
      maxTimeout = null;
    }
    if (regularTimeout) {
      clearTimeout(regularTimeout);
      regularTimeout = null;
    }
  };

  const run = () => {
    clearTimeouts();
    fun();
  };

  const instance = {
    trigger() {
      if (!maxTimeout) {
        maxTimeout = setTimeout(run, maximum);
      }
      if (regularTimeout) {
        clearTimeout(regularTimeout);
      }
      regularTimeout = setTimeout(run, reset);
    },

    clear() {
      clearTimeouts();
    }
  };

  return instance;
};

export default doubleTimeout;
