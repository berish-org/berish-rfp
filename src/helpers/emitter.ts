import guid from 'berish-guid';
import LINQ from '@berish/linq';

interface IEventSubscribeObject {
  id: string;
  eventName: string;
  callback: (data?: any) => void;
}

export class Emitter<EventsObject extends object> {
  private _subscribes: LINQ<IEventSubscribeObject> = LINQ.from();

  on = <Key extends keyof EventsObject & string>(eventName: Key, callback: (data?: EventsObject[Key]) => void) => {
    const id = guid.guid();
    const obj = { id, eventName, callback };
    if (!this._subscribes.where((m) => m.eventName === eventName).contains(obj, (m) => m.callback))
      this._subscribes.push(obj);
    return id;
  };

  emit = <Key extends keyof EventsObject & string>(eventName: Key, data?: EventsObject[Key]) => {
    const subscribes = this._subscribes.where((m) => m.eventName === eventName);
    subscribes.forEach((m) => setImmediate(() => m.callback(data), 0));
  };

  emitAndWait = async <Key extends keyof EventsObject & string>(eventName: Key, data?: EventsObject[Key]) => {
    const subscribes = this._subscribes.where((m) => m.eventName === eventName);
    await Promise.all(subscribes.map((m) => m.callback(data)));
  };

  hasListeners = <Key extends keyof EventsObject & string>(eventName: Key) => {
    return this._subscribes.where((m) => m.eventName === eventName).length > 0;
  };

  off = (id: string) => {
    this._subscribes = this._subscribes.where((m) => m.id !== id);
  };

  offEvent = <Key extends keyof EventsObject & string>(eventName: Key) => {
    this._subscribes = this._subscribes.where((m) => m.eventName !== eventName);
  };

  offAll = () => {
    this._subscribes = LINQ.from([]);
  };
}
