import { Serber, plugins } from '@berish/serber';
import { bufferToBufferPrintPlugin } from './bufferToBufferPrintPlugin/plugin';
import { classInstanceToClassPrintPlugin } from './classInstanceToClassPrintPlugin/plugin';
import { functionToFunctionPrintPlugin } from './functionToFunctionPrintPlugin/plugin';
import { errorToErrorPrintPlugin } from './errorToErrorPrintPlugin/plugin';
import { peerDecoratorToResultPlugin } from './peerDecoratorToResultPlugin/plugin';

export type InternalPluginsType = typeof internalPlugins;

export const internalPlugins = {
  bufferToBufferPrintPlugin,
  peerDecoratorToResultPlugin,
  classInstanceToClassPrintPlugin,
  functionToFunctionPrintPlugin,
  errorToErrorPrintPlugin,
};

export const serberWithPlugins = new Serber({ throwWhenError: true })
  .addPlugin(plugins.undefinedPlugin)
  .addPlugin(plugins.nullPlugin)
  .addPlugin(plugins.boolPlugin)
  .addPlugin(plugins.numberPlugin)
  .addPlugin(plugins.stringPlugin)
  .addPlugin(plugins.datePlugin)
  .addPlugin(plugins.regExpPlugin)
  .addPlugin(plugins.arrayPlugin)
  .addPlugin(bufferToBufferPrintPlugin)
  .addPlugin(peerDecoratorToResultPlugin)
  .addPlugin(classInstanceToClassPrintPlugin)
  .addPlugin(functionToFunctionPrintPlugin)
  .addPlugin(errorToErrorPrintPlugin)
  .addPlugin(plugins.loopObjectPlugin);
