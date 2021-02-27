import type { PeerLogger } from './logger';

export function getConsoleLogger(): PeerLogger {
  const getConsoleLogger = (currentModuleNames: string[] = []) => {
    const logger: PeerLogger = (name: string) => getConsoleLogger([...currentModuleNames, name].filter(Boolean));
    logger.info = (...args: any[]) => console.info(currentModuleNames.map((m) => `[${m}]`).join(''), ...args);
    logger.warn = (...args: any[]) => console.warn(currentModuleNames.map((m) => `[${m}]`).join(''), ...args);
    logger.error = (...args: any[]) => console.error(currentModuleNames.map((m) => `[${m}]`).join(''), ...args);

    return logger;
  };
  return getConsoleLogger([]);
}
