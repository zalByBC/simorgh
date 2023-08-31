/* eslint-disable no-console */

const JsdomEnvironment = require('jest-environment-jsdom').TestEnvironment;
const fetchDom = require('./utils/fetchDom');
const getPageTypeFromTestPath = require('./utils/getPageTypeFromTestPath');
const camelCaseToText = require('./utils/camelCaseToText');

class IntegrationTestEnvironment extends JsdomEnvironment {
  constructor(config, context) {
    super(config, context);
    const { platform } = config.projectConfig.testEnvironmentOptions;
    const {
      pathname,
      service,
      runScripts = 'true',
      displayAds = 'false',
      isInUK = 'false',
    } = context.docblockPragmas;
    const pageType = getPageTypeFromTestPath(context.testPath);

    this.pageType = camelCaseToText(pageType);
    this.service = service;
    this.runScripts = runScripts === 'true';
    this.displayAds = displayAds === 'true';
    this.displayAds = isInUK === 'true';
    this.url = `http://localhost:7080${pathname}${
      platform === 'amp' ? '.amp' : ''
    }`;
  }

  async setup() {
    await super.setup();

    try {
      const dom = await fetchDom({
        url: this.url,
        runScripts: this.runScripts,
        headers: {
          ...(this.displayAds && { 'BBC-Adverts': 'true' }),
          ...(this.isInUK && { 'x-bbc-edge-isuk': 'yes' }),
        },
      });

      Object.defineProperties(this.global, {
        pageType: { value: this.pageType },
        service: { value: this.service },
        window: { value: dom.window },
        document: { value: dom.window.document },
      });
    } catch (e) {
      console.error(e);
    }
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = IntegrationTestEnvironment;
