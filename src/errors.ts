export enum ErrorTypeEnum {
  UNKNOWN_ERROR = 0,
  PATH_NOT_FOUND = 1,
  SERVICE_CHANNEL_NAME_EMPTY = 2,
  PROXY_CONNECTION_DATA_CONFUSED = 3,
  INITIAL_CONNECTION_ERROR = 4,
  RFP_DISCONNECTED = 5,
}

export const errorLabels: [ErrorTypeEnum, string][] = [
  [ErrorTypeEnum.UNKNOWN_ERROR, 'Unknown error'],
  [ErrorTypeEnum.PATH_NOT_FOUND, 'Path is not found'],
  [ErrorTypeEnum.SERVICE_CHANNEL_NAME_EMPTY, 'Service channel: moduleName or commandName is empty'],
  [ErrorTypeEnum.PROXY_CONNECTION_DATA_CONFUSED, 'Connection data refused'],
  [ErrorTypeEnum.INITIAL_CONNECTION_ERROR, 'Attemp for connect refused by rfp, try again'],
  [ErrorTypeEnum.RFP_DISCONNECTED, 'RfpPeer is disconnected now'],
];

export function generateError(type: ErrorTypeEnum) {
  type = type || ErrorTypeEnum.UNKNOWN_ERROR;
  const strType = ErrorTypeEnum[type];
  const messageType = errorLabels.filter((m) => m[0] === type)[0];
  const err = new Error();
  err.name = strType;
  err.message = `RFP ERROR: ${strType}. ${messageType && messageType[1]}`;
  delete err.stack;
  return err;
}
