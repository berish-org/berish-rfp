export interface PeerLogger {
  (moduleName: string): PeerLogger;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}
