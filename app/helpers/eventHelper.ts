const debounce = (callback: (...args: any) => void, wait: number) => {
  let timerId: NodeJS.Timeout;

  return (...args: any) => {
    // Specific to the React
    // Functions getting nullified, to prevent it
    // we call persist() method, if possible
    // https://medium.com/@anuhosad/debouncing-events-with-react-b8c405c33273
    args.forEach((arg: any) => {
      arg?.persist();
    });

    clearTimeout(timerId);
    timerId = setTimeout(() => callback(...args), wait);
  };
};

export default debounce;
