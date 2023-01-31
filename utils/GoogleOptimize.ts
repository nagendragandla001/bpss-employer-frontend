/* eslint-disable camelcase */
import { mLog } from 'utils/logger';

declare global {
  interface Window {
    google_optimize: any;
  }
}

export const activateGoogleOptimize = (experimentId, template = null) => {
  let optimizeActivationAttempt = 0;
  let gaVariant = '';
  let promise: any = null;

  promise = new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      if (optimizeActivationAttempt < 5) {
        // So that unsupported browsers can see the page too
        optimizeActivationAttempt += 1;
        if (typeof window !== 'undefined' && window.google_optimize !== undefined) {
          clearInterval(intervalId);
          gaVariant = window.google_optimize.get(experimentId);
          if (template) {
            gaVariant = template[gaVariant];
          }
          mLog(`=== GOOGLE OPTIMIZE -> EXP-ID: ${experimentId} VARIANT: ${gaVariant}`);
          resolve(gaVariant);
        }
      } else {
        clearInterval(intervalId);
        mLog("GOOGLE OPTIMIZE ISN'T SUPPORTED ACTIVATION");
        resolve(gaVariant);
      }
    }, 100);
  });

  return promise;
};

export const getVariantWithTemplate = (experimentId, template = null) => {
  let gaVariant = '';
  if (typeof window !== 'undefined' && window.google_optimize !== undefined) {
    gaVariant = window.google_optimize.get(experimentId);
    if (template) {
      gaVariant = template[gaVariant];
    }
    mLog('GOOGLE OPTIMIZE VARIANT GETTER', gaVariant);
  } else {
    mLog("GOOGLE OPTIMIZE ISN'T SUPPORTED GETTER");
  }
  return gaVariant;
};
