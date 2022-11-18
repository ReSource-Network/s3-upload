import * as core from '@actions/core';

export const overwriteLogger = () => {
  const originalCoreLog = core.info;
  const originalCoreDebug = core.debug;

  // @ts-expect-error
  core.info = (message: string) => {
    const date = new Date();
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

    return originalCoreLog(
      `[${`0${date.getHours()}`.slice(-2)}:${`0${date.getMinutes()}`.slice(
        -2
      )}:${`0${date.getSeconds()}`.slice(-2)} ${ampm}] ${message}`
    );
  };

  // @ts-expect-error
  core.debug = (message: string) => {
    const date = new Date();
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

    return originalCoreDebug(
      `[${`0${date.getHours()}`.slice(-2)}:${`0${date.getMinutes()}`.slice(
        -2
      )}:${`0${date.getSeconds()}`.slice(-2)} ${ampm}] ${message}`
    );
  };
};
