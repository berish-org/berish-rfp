import * as colors from 'colors/safe';

interface ILogger {
  (moduleName: string): ILogger;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  disable: boolean;
}

export function getLogger(moduleName: string) {
  const getLogger = (moduleName: string, previosModuleNames?: string[]) => {
    const currentModuleNames = previosModuleNames.concat(moduleName);
    const logger = (name: string) => {
      const temp = getLogger(name, currentModuleNames);
      temp.disable = !!logger.disable;
      return temp;
    };
    logger.info = (...args: any[]) =>
      logger.disable || console.info(colors.green(currentModuleNames.map((m) => `[${m}]`).join('')), ...args);
    logger.warn = (...args: any[]) =>
      logger.disable || console.warn(colors.yellow(currentModuleNames.map((m) => `[${m}]`).join('')), ...args);
    logger.error = (...args: any[]) =>
      logger.disable || console.error(colors.red(currentModuleNames.map((m) => `[${m}]`).join('')), ...args);
    if (!moduleName) logger.disable = true;
    return logger as ILogger;
  };
  return getLogger(moduleName, []);
}
