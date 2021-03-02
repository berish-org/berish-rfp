import type { PeerLogger } from './logger';

export function getConsoleLogger(peerName: string): PeerLogger {
  const getConsoleLogger = (currentModuleNames: string[] = []) => {
    const logger: PeerLogger = (name: string) => getConsoleLogger([...currentModuleNames, name].filter(Boolean));

    logger.info = (...args: any[]) =>
      peerName && console.info(currentModuleNames.map((m) => `[${m}]`).join(''), ...args);
    logger.warn = (...args: any[]) =>
      peerName && console.warn(currentModuleNames.map((m) => `[${m}]`).join(''), ...args);
    logger.error = (...args: any[]) =>
      peerName && console.error(currentModuleNames.map((m) => `[${m}]`).join(''), ...args);

    return logger;
  };
  return getConsoleLogger([peerName]);
}
