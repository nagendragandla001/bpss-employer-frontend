/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
import yaml from 'js-yaml';
import { readFileSync, existsSync } from 'fs';
import { flatten } from 'flat';
import { mLog } from 'utils/logger';

const POSSIBLE_PATHS = {
  config: [
    './config.yml',
    '/app/config/config.yml',
  ],
  secret: [
    './secret.yml',
    '/app/secret/secret.yml',
  ],
};

export default class AppSettings {
  // private config: {[index: string]: string | number}

  // private secrets: {[index: string]: string | number}

  // constructor(configPath?: string, secretPath?: string) {
  //   mLog('Initialising Settings...');
  //   this.config = flatten(this.readConfiguration(configPath));
  //   this.secrets = flatten(this.readSecrets(secretPath));
  // }

  // private readConfiguration(fileLocation?: string) {
  //   // Check existence of file
  //   if (fileLocation && !existsSync(fileLocation)) {
  //     throw new Error(`Missing config file: ${fileLocation}`);
  //   } else {
  //     for (const element of POSSIBLE_PATHS.config) {
  //       if (existsSync(element)) {
  //         fileLocation = element;
  //         break;
  //       }
  //     }
  //     if (!fileLocation) {
  //       throw new Error('Missing config yml file.');
  //     }
  //   }
  //   return yaml.safeLoad(readFileSync(fileLocation, 'utf-8'));
  // }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  // private readSecrets(fileLocation?: string) {
  //   // Check existence of file
  //   if (fileLocation && !existsSync(fileLocation)) {
  //     throw new Error(`Missing config file: ${fileLocation}`);
  //   } else {
  //     for (const element of POSSIBLE_PATHS.secret) {
  //       if (existsSync(element)) {
  //         fileLocation = element;
  //         break;
  //       }
  //     }
  //     if (!fileLocation) {
  //       throw new Error('Missing config yml file.');
  //     }
  //   }
  //   return yaml.safeLoad(readFileSync(fileLocation, 'utf-8'));
  // }

  // public get(key: string, mandatory = true, defaultValue?: any): any {
  //   const cValue = this.config[key];
  //   const sValue = this.secrets[key];
  //   if (mandatory && !cValue && !sValue) {
  //     throw new Error(`Missing mandatory setting: ${key}`);
  //   }
  //   if (!cValue && !sValue) {
  //     return defaultValue;
  //   }
  //   return cValue || sValue;
  // }
}
