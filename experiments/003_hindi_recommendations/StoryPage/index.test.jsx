/* eslint-disable */

jest.mock('@optimizely/react-sdk', () => {
  const actualModules = jest.requireActual('@optimizely/react-sdk');
  return {
    __esModule: true,
    ...actualModules,
    OptimizelyExperiment: jest.fn(),
  };
});

const optimizely = {
  onReady: jest.fn(() => Promise.resolve()),
  track: jest.fn(),
  user: {
    attributes: {},
  },
  close: jest.fn(),
};

const PageWithContext = ({
  pageData,
  service,
  showAdsBasedOnLocation = false,
  isAmp = false,
  toggles = defaultToggleState,
}) => (
  <StaticRouter>
    <ToggleContext.Provider
      value={{ toggleState: toggles, toggleDispatch: jest.fn() }}
    >
      <ServiceContextProvider
        pageLang={pageData.metadata.language}
        service={service}
      >
        <RequestContextProvider
          bbcOrigin="https://www.test.bbc.co.uk"
          isAmp={isAmp}
          pageType={pageData.metadata.type}
          pathname={pageData.metadata.locators.assetUri}
          service={service}
          statusCode={200}
          showAdsBasedOnLocation={showAdsBasedOnLocation}
        >
          <EventTrackingContextProvider pageData={pageData}>
            <OptimizelyProvider optimizely={optimizely} isServerSide>
              <StoryPage service={service} pageData={pageData} />
            </OptimizelyProvider>
          </EventTrackingContextProvider>
        </RequestContextProvider>
      </ServiceContextProvider>
    </ToggleContext.Provider>
  </StaticRouter>
);

jest.mock('#hooks/useOptimizelyVariation', () => jest.fn(() => null));

const pageType = 'cpsAsset';

describe('Story Page', () => {
  const appEnv = process.env.SIMORGH_APP_ENV;
  beforeEach(() => {
    process.env.SIMORGH_ICHEF_BASE_URL = 'https://ichef.test.bbci.co.uk';
  });

  afterEach(() => {
    fetchMock.restore();
    delete process.env.SIMORGH_ICHEF_BASE_URL;
    process.env.SIMORGH_APP_ENV = appEnv;
  });

  describe('Optimizely Experiments', () => {
    describe('003_hindi_experiment_feature', () => {
      describe('control', () => {
        beforeEach(() => {
          OptimizelyExperiment.mockImplementation(props => {
            const { children } = props;

            const variation = 'control';

            if (children != null && typeof children === 'function') {
              return <>{children(variation, true, false)}</>;
            }

            return null;
          });
        });

        afterEach(() => {
          jest.clearAllMocks();
        });

        afterAll(() => {
          jest.restoreAllMocks();
        });

        it('should render recommendations when variation is control', async () => {
          const toggles = {
            cpsRecommendations: {
              enabled: true,
            },
            eventTracking: {
              enabled: true,
            },
          };
          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/india-60426858/recommendations.json',
            hindiRecommendationsData,
          );
          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <PageWithContext
              pageData={pageData}
              service="hindi"
              toggles={toggles}
            />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );
          expect(RecommendationsRegions).toHaveLength(1);
        });

        it('should render recommendations when variation is null or undefined', async () => {
          OptimizelyExperiment.mockImplementation(props => {
            const { children } = props;

            if (children != null && typeof children === 'function') {
              return <>{children(undefined, true, false)}</>;
            }

            return null;
          });
          const toggles = {
            cpsRecommendations: {
              enabled: true,
            },
            eventTracking: {
              enabled: true,
            },
          };
          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/india-60426858/recommendations.json',
            hindiRecommendationsData,
          );
          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <PageWithContext
              pageData={pageData}
              service="hindi"
              toggles={toggles}
            />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );
          expect(RecommendationsRegions).toHaveLength(1);
        });

        it('should not render recommendations when recommendations are not enabled', async () => {
          const toggles = {
            eventTracking: {
              enabled: true,
            },
          };
          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/india-60426858/recommendations.json',
            hindiRecommendationsData,
          );
          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <PageWithContext
              pageData={pageData}
              service="hindi"
              toggles={toggles}
            />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );
          expect(RecommendationsRegions).toHaveLength(0);
        });

        describe('Event Tracking', () => {
          describe('View Tracking', () => {
            it('should send ATI and Optimizely view tracking event when recommendations render', async () => {
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
                eventTracking: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              fetchMock.mock(
                'http://localhost/hindi/india-60426858/recommendations.json',
                hindiRecommendationsData,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              await waitFor(
                () => {
                  const wsojViewCalls = sendEventBeacon.mock.calls.filter(
                    ([{ campaignID, componentName }]) =>
                      componentName === 'wsoj' ||
                      campaignID.includes('cps_wsoj'),
                  );
                  expect(wsojViewCalls.length).toBe(5);
                  expect(optimizely.track).toHaveBeenCalledTimes(1);
                  expect(optimizely.track).toBeCalledWith(
                    'component_views',
                    undefined,
                    { viewed_wsoj: true },
                  );
                },
                { timeout: 2000 },
              );
            }, 10000);

            it('should not send ATI or Optimizely view tracking event when event tracking is not enabled', async () => {
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              fetchMock.mock(
                'http://localhost/hindi/india-60426858/recommendations.json',
                hindiRecommendationsData,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              await waitFor(
                () => {
                  const wsojViewCalls = sendEventBeacon.mock.calls.filter(
                    ([{ campaignID, componentName }]) =>
                      campaignID.includes('cps_wsoj') ||
                      componentName === 'wsoj',
                  );
                  expect(wsojViewCalls.length).toBe(0);
                  expect(optimizely.track).toHaveBeenCalledTimes(0);
                },
                { timeout: 2000 },
              );
            }, 10000);

            it('should send only ATI view tracking event when service is not hindi', async () => {
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
                eventTracking: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                mundoPageData,
              );
              fetchMock.mock(
                'http://localhost/mundo/mostread.json',
                mundoMostRead,
              );
              fetchMock.mock(
                'http://localhost/mundo/noticias-56669604/recommendations.json',
                mundoRecommendationsData,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'mundo',
                pageType,
              });

              render(
                <PageWithContext
                  pageData={pageData}
                  service="mundo"
                  toggles={toggles}
                />,
              );

              await waitFor(
                () => {
                  const wsojViewCalls = sendEventBeacon.mock.calls.filter(
                    ([{ campaignID, componentName }]) =>
                      campaignID.includes('wsoj') || componentName === 'wsoj',
                  );
                  expect(wsojViewCalls.length).toBe(5);
                  expect(optimizely.track).toHaveBeenCalledTimes(0);
                },
                { timeout: 2000 },
              );
            }, 10000);
          });

          describe('Click Tracking', () => {
            it('should send ATI and Optimizely click tracking events when link is clicked', async () => {
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
                eventTracking: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              fetchMock.mock(
                'http://localhost/hindi/india-60426858/recommendations.json',
                hindiRecommendationsData,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              const { getByText } = render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              const firstBlockRecommendationLink = getByText(
                'कोविड-19 महामारीः तो सबसे ज़्यादा मौतों की वजह वायरस नहीं होगा',
              );
              userEvent.click(firstBlockRecommendationLink);

              await waitFor(
                () => {
                  const wsojClickCalls = sendEventBeacon.mock.calls.filter(
                    ([{ type }]) => type === 'click',
                  );
                  expect(wsojClickCalls.length).toBe(2);
                  const optimizelyClickCalls =
                    optimizely.track.mock.calls.filter(
                      ([eventName]) => eventName === 'component_clicks',
                    );
                  expect(optimizelyClickCalls.length).toBe(1);
                  expect(optimizelyClickCalls[0]).toEqual([
                    'component_clicks',
                    undefined,
                    { clicked_wsoj: true },
                  ]);
                },
                { timeout: 2000 },
              );
            }, 10000);

            it('should not send ATI or Optimizely click tracking events when event tracking is not enabled', async () => {
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              fetchMock.mock(
                'http://localhost/hindi/india-60426858/recommendations.json',
                hindiRecommendationsData,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              const { getByText } = render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              const firstBlockRecommendationLink = getByText(
                'कोविड-19 महामारीः तो सबसे ज़्यादा मौतों की वजह वायरस नहीं होगा',
              );
              userEvent.click(firstBlockRecommendationLink);

              await waitFor(
                () => {
                  const wsojClickCalls = sendEventBeacon.mock.calls.filter(
                    ([{ type }]) => type === 'click',
                  );
                  expect(wsojClickCalls.length).toBe(0);
                  const optimizelyClickCalls =
                    optimizely.track.mock.calls.filter(
                      ([eventName]) => eventName === 'component_clicks',
                    );
                  expect(optimizelyClickCalls.length).toBe(0);
                },
                { timeout: 2000 },
              );
            }, 10000);

            it('should send only ATI click tracking event when service is not hindi and a link is clicked', async () => {
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
                eventTracking: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                mundoPageData,
              );
              fetchMock.mock(
                'http://localhost/mundo/mostread.json',
                mundoMostRead,
              );
              fetchMock.mock(
                'http://localhost/mundo/noticias-56669604/recommendations.json',
                mundoRecommendationsData,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'mundo',
                pageType,
              });

              const { getByText } = render(
                <PageWithContext
                  pageData={pageData}
                  service="mundo"
                  toggles={toggles}
                />,
              );

              const firstBlockRecommendationLink = getByText(
                'Soy una mujer genocida y aún me persiguen los recuerdos de lo que hice',
              );
              userEvent.click(firstBlockRecommendationLink);

              await waitFor(
                () => {
                  const wsojClickCalls = sendEventBeacon.mock.calls.filter(
                    ([{ type }]) => type === 'click',
                  );
                  expect(wsojClickCalls.length).toBe(2);
                  expect(optimizely.track).toHaveBeenCalledTimes(0);
                },
                { timeout: 2000 },
              );
            }, 10000);
          });
        });
      });

      describe('variation_1', () => {
        beforeEach(() => {
          OptimizelyExperiment.mockImplementation(props => {
            const { children } = props;

            const variation = 'variation_1';

            if (children != null && typeof children === 'function') {
              return <>{children(variation, true, false)}</>;
            }

            return null;
          });
        });

        afterAll(() => {
          jest.restoreAllMocks();
        });

        it('should render split recommendations when variation is variation_1', async () => {
          const toggles = {
            cpsRecommendations: {
              enabled: true,
            },
            eventTracking: {
              enabled: true,
            },
          };
          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/india-60426858/recommendations.json',
            hindiRecommendationsData,
          );
          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <PageWithContext
              pageData={pageData}
              service="hindi"
              toggles={toggles}
            />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );
          expect(RecommendationsRegions).toHaveLength(2);
        });

        it('should not render split recommendations when recommendations are not enabled', async () => {
          const toggles = {
            eventTracking: {
              enabled: true,
            },
          };
          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/india-60426858/recommendations.json',
            hindiRecommendationsData,
          );
          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <PageWithContext
              pageData={pageData}
              service="hindi"
              toggles={toggles}
            />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );

          expect(RecommendationsRegions).toHaveLength(0);
        });

        it('should not render split recommendations when variation is not variation_1', async () => {
          OptimizelyExperiment.mockImplementation(props => {
            const { children } = props;

            const variation = 'control';

            if (children != null && typeof children === 'function') {
              return <>{children(variation, true, false)}</>;
            }

            return null;
          });
          const toggles = {
            cpsRecommendations: {
              enabled: true,
            },
            eventTracking: {
              enabled: true,
            },
          };
          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/india-60426858/recommendations.json',
            hindiRecommendationsData,
          );
          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <PageWithContext
              pageData={pageData}
              service="hindi"
              toggles={toggles}
            />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );

          expect(RecommendationsRegions).toHaveLength(1);
        });

        describe('Event Tracking', () => {
          beforeEach(() => {
            jest.useFakeTimers();
            jest.resetModules();
          });

          afterEach(() => {
            jest.useRealTimers();
            jest.clearAllMocks();
          });

          // These tests override the default timeout as they fail sometimes when timeout is on default (5000)
          describe('View Tracking', () => {
            it('should send one view event to ATI and Optimizely when either block is viewed', async () => {
              const expectedViewEvent = [
                [
                  {
                    advertiserID: undefined,
                    campaignID: 'article-sty',
                    componentName: 'wsoj',
                    format: undefined,
                    pageIdentifier: 'india::hindi.india.story.60426858.page',
                    platform: 'canonical',
                    producerId: '52',
                    service: 'hindi',
                    statsDestination: 'WS_NEWS_LANGUAGES_TEST',
                    type: 'view',
                    url: undefined,
                  },
                ],
              ];
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
                eventTracking: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              fetchMock.mock(
                'http://localhost/hindi/india-60426858/recommendations.json',
                hindiRecommendationsData,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              await waitFor(
                () => {
                  const wsojViewCalls = sendEventBeacon.mock.calls.filter(
                    ([{ componentName, pageIdentifier }]) =>
                      componentName === 'wsoj' &&
                      pageIdentifier ===
                        'india::hindi.india.story.60426858.page',
                  );
                  expect(wsojViewCalls.length).toBe(1);
                  expect(wsojViewCalls).toEqual(expectedViewEvent);
                  expect(optimizely.track).toHaveBeenCalledTimes(1);
                  expect(optimizely.track).toBeCalledWith(
                    'component_views',
                    undefined,
                    { viewed_wsoj: true },
                  );
                },
                { timeout: 2000 },
              );
            }, 10000);

            it('should send one view event to ATI and Optimizely when there is only one block on the page and it is viewed', async () => {
              const expectedViewEvent = [
                [
                  {
                    advertiserID: undefined,
                    campaignID: 'article-sty',
                    componentName: 'wsoj',
                    format: undefined,
                    pageIdentifier: 'india::hindi.india.story.60426858.page',
                    platform: 'canonical',
                    producerId: '52',
                    service: 'hindi',
                    statsDestination: 'WS_NEWS_LANGUAGES_TEST',
                    type: 'view',
                    url: undefined,
                  },
                ],
              ];
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
                eventTracking: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              fetchMock.mock(
                'http://localhost/hindi/india-60426858/recommendations.json',
                hindiRecommendationsData.slice(0, 2),
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              await waitFor(
                () => {
                  const wsojViewCalls = sendEventBeacon.mock.calls.filter(
                    ([{ componentName }]) => componentName === 'wsoj',
                  );

                  expect(wsojViewCalls.length).toBe(1);
                  expect(wsojViewCalls).toEqual(expectedViewEvent);
                  expect(optimizely.track).toHaveBeenCalledTimes(1);
                  expect(optimizely.track).toBeCalledWith(
                    'component_views',
                    undefined,
                    { viewed_wsoj: true },
                  );
                },
                { timeout: 2000 },
              );
            }, 10000);

            it('should not send view events to ATI and Optimizely when there are no recommendations on the page', async () => {
              const toggles = {
                eventTracking: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              await waitFor(
                () => {
                  const wsojViewCalls = sendEventBeacon.mock.calls.filter(
                    ([{ componentName }]) => componentName === 'wsoj',
                  );
                  expect(wsojViewCalls.length).toBe(0);
                  expect(optimizely.track).toHaveBeenCalledTimes(0);
                },
                { timeout: 2000 },
              );
            }, 10000);

            it('should not send view events when eventTracking is not enabled', async () => {
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              await waitFor(
                () => {
                  const wsojViewCalls = sendEventBeacon.mock.calls.filter(
                    ([{ componentName }]) => componentName === 'wsoj',
                  );
                  expect(wsojViewCalls.length).toBe(0);
                  expect(optimizely.track).toHaveBeenCalledTimes(0);
                },
                { timeout: 2000 },
              );
            });
          });

          describe('Click Tracking', () => {
            it('should send a click event to ATI and Optimizely when page has two blocks and a link in the first block is clicked', async () => {
              const expectedATIClickEvents = [
                [
                  {
                    advertiserID: undefined,
                    campaignID: 'article-sty',
                    componentName: 'wsoj',
                    format: undefined,
                    pageIdentifier: 'india::hindi.india.story.60426858.page',
                    platform: 'canonical',
                    producerId: '52',
                    service: 'hindi',
                    statsDestination: 'WS_NEWS_LANGUAGES_TEST',
                    type: 'click',
                    url: undefined,
                  },
                ],
                [
                  {
                    advertiserID: 'hindi',
                    campaignID: 'cps_wsoj',
                    componentName:
                      '%E0%A4%95%E0%A5%8B%E0%A4%B5%E0%A4%BF%E0%A4%A1-19%20%E0%A4%AE%E0%A4%B9%E0%A4%BE%E0%A4%AE%E0%A4%BE%E0%A4%B0%E0%A5%80%E0%A4%83%20%E0%A4%A4%E0%A5%8B%20%E0%A4%B8%E0%A4%AC%E0%A4%B8%E0%A5%87%20%E0%A4%9C%E0%A4%BC%E0%A5%8D%E0%A4%AF%E0%A4%BE%E0%A4%A6%E0%A4%BE%20%E0%A4%AE%E0%A5%8C%E0%A4%A4%E0%A5%8B%E0%A4%82%20%E0%A4%95%E0%A5%80%20%E0%A4%B5%E0%A4%9C%E0%A4%B9%20%E0%A4%B5%E0%A4%BE%E0%A4%AF%E0%A4%B0%E0%A4%B8%20%E0%A4%A8%E0%A4%B9%E0%A5%80%E0%A4%82%20%E0%A4%B9%E0%A5%8B%E0%A4%97%E0%A4%BE',
                    format: 'CHD=promo::1',
                    pageIdentifier: 'india::hindi.india.story.60426858.page',
                    platform: 'canonical',
                    producerId: '52',
                    service: 'hindi',
                    statsDestination: 'WS_NEWS_LANGUAGES_TEST',
                    type: 'click',
                    url: 'undefined/hindi/vert-fut-53035307',
                  },
                ],
              ];
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
                eventTracking: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              fetchMock.mock(
                'http://localhost/hindi/india-60426858/recommendations.json',
                hindiRecommendationsData,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              const { getByText } = render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              const firstBlockRecommendationLink = getByText(
                'कोविड-19 महामारीः तो सबसे ज़्यादा मौतों की वजह वायरस नहीं होगा',
              );
              userEvent.click(firstBlockRecommendationLink);
              await waitFor(
                () => {
                  const wsojClickCalls = sendEventBeacon.mock.calls.filter(
                    ([{ type }]) => type === 'click',
                  );
                  expect(wsojClickCalls.length).toBe(2);
                  expect(wsojClickCalls).toEqual(expectedATIClickEvents);
                  const optimizelyClickCalls =
                    optimizely.track.mock.calls.filter(
                      ([eventName]) => eventName === 'component_clicks',
                    );
                  expect(optimizelyClickCalls.length).toBe(1);
                  expect(optimizelyClickCalls[0]).toEqual([
                    'component_clicks',
                    undefined,
                    { clicked_wsoj: true },
                  ]);
                },
                { timeout: 2000 },
              );
            }, 10000);

            it('should send a click event to ATI and Optimizely when a link is clicked in the second block is clicked', async () => {
              const expectedATIClickEvents = [
                [
                  {
                    advertiserID: undefined,
                    campaignID: 'article-sty',
                    componentName: 'wsoj',
                    format: undefined,
                    pageIdentifier: 'india::hindi.india.story.60426858.page',
                    platform: 'canonical',
                    producerId: '52',
                    service: 'hindi',
                    statsDestination: 'WS_NEWS_LANGUAGES_TEST',
                    type: 'click',
                    url: undefined,
                  },
                ],
                [
                  {
                    advertiserID: 'hindi',
                    campaignID: 'cps_wsoj',
                    componentName:
                      '%E0%A4%95%E0%A5%8B%E0%A4%B5%E0%A4%BF%E0%A4%A1-19%20%E0%A4%95%E0%A5%87%20%E0%A4%AC%E0%A4%BE%E0%A4%A6%20%E0%A4%B9%E0%A4%AE%E0%A4%BE%E0%A4%B0%E0%A5%80%20%E0%A4%AF%E0%A4%BE%E0%A4%A4%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%8F%E0%A4%82%20%E0%A4%95%E0%A5%88%E0%A4%B8%E0%A5%80%20%E0%A4%B9%E0%A5%8B%E0%A4%82%E0%A4%97%E0%A5%80%3F',
                    format: 'CHD=promo::1',
                    pageIdentifier: 'india::hindi.india.story.60426858.page',
                    platform: 'canonical',
                    producerId: '52',
                    service: 'hindi',
                    statsDestination: 'WS_NEWS_LANGUAGES_TEST',
                    type: 'click',
                    url: 'undefined/hindi/vert-tra-52355324',
                  },
                ],
              ];
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
                eventTracking: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              fetchMock.mock(
                'http://localhost/hindi/india-60426858/recommendations.json',
                hindiRecommendationsData,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              const { getByText } = render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              const secondBlockRecommendationLink = getByText(
                'कोविड-19 के बाद हमारी यात्राएं कैसी होंगी?',
              );
              userEvent.click(secondBlockRecommendationLink);
              await waitFor(
                () => {
                  const wsojClickCalls = sendEventBeacon.mock.calls.filter(
                    ([{ type }]) => type === 'click',
                  );
                  expect(wsojClickCalls.length).toBe(2);
                  expect(wsojClickCalls).toEqual(expectedATIClickEvents);
                  const optimizelyClickCalls =
                    optimizely.track.mock.calls.filter(
                      ([eventName]) => eventName === 'component_clicks',
                    );
                  expect(optimizelyClickCalls.length).toBe(1);
                  expect(optimizelyClickCalls[0]).toEqual([
                    'component_clicks',
                    undefined,
                    { clicked_wsoj: true },
                  ]);
                },
                { timeout: 2000 },
              );
            }, 10000);

            it('should send a click event to ATI and Optimizely when page has one block and a link in the block is clicked', async () => {
              const expectedATIClickEvents = [
                [
                  {
                    advertiserID: undefined,
                    campaignID: 'article-sty',
                    componentName: 'wsoj',
                    format: undefined,
                    pageIdentifier: 'india::hindi.india.story.60426858.page',
                    platform: 'canonical',
                    producerId: '52',
                    service: 'hindi',
                    statsDestination: 'WS_NEWS_LANGUAGES_TEST',
                    type: 'click',
                    url: undefined,
                  },
                ],
                [
                  {
                    advertiserID: 'hindi',
                    campaignID: 'cps_wsoj',
                    componentName:
                      '%E0%A4%95%E0%A5%8B%E0%A4%B5%E0%A4%BF%E0%A4%A1-19%20%E0%A4%AE%E0%A4%B9%E0%A4%BE%E0%A4%AE%E0%A4%BE%E0%A4%B0%E0%A5%80%E0%A4%83%20%E0%A4%A4%E0%A5%8B%20%E0%A4%B8%E0%A4%AC%E0%A4%B8%E0%A5%87%20%E0%A4%9C%E0%A4%BC%E0%A5%8D%E0%A4%AF%E0%A4%BE%E0%A4%A6%E0%A4%BE%20%E0%A4%AE%E0%A5%8C%E0%A4%A4%E0%A5%8B%E0%A4%82%20%E0%A4%95%E0%A5%80%20%E0%A4%B5%E0%A4%9C%E0%A4%B9%20%E0%A4%B5%E0%A4%BE%E0%A4%AF%E0%A4%B0%E0%A4%B8%20%E0%A4%A8%E0%A4%B9%E0%A5%80%E0%A4%82%20%E0%A4%B9%E0%A5%8B%E0%A4%97%E0%A4%BE',
                    format: 'CHD=promo::1',
                    pageIdentifier: 'india::hindi.india.story.60426858.page',
                    platform: 'canonical',
                    producerId: '52',
                    service: 'hindi',
                    statsDestination: 'WS_NEWS_LANGUAGES_TEST',
                    type: 'click',
                    url: 'undefined/hindi/vert-fut-53035307',
                  },
                ],
              ];
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
                eventTracking: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              fetchMock.mock(
                'http://localhost/hindi/india-60426858/recommendations.json',
                hindiRecommendationsData.slice(0, 2),
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              const { getByText } = render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              const firstBlockRecommendationLink = getByText(
                'कोविड-19 महामारीः तो सबसे ज़्यादा मौतों की वजह वायरस नहीं होगा',
              );
              userEvent.click(firstBlockRecommendationLink);
              await waitFor(
                () => {
                  const wsojClickCalls = sendEventBeacon.mock.calls.filter(
                    ([{ type }]) => type === 'click',
                  );
                  expect(wsojClickCalls.length).toBe(2);
                  expect(wsojClickCalls).toEqual(expectedATIClickEvents);
                  const optimizelyClickCalls =
                    optimizely.track.mock.calls.filter(
                      ([eventName]) => eventName === 'component_clicks',
                    );
                  expect(optimizelyClickCalls.length).toBe(1);
                  expect(optimizelyClickCalls[0]).toEqual([
                    'component_clicks',
                    undefined,
                    { clicked_wsoj: true },
                  ]);
                },
                { timeout: 2000 },
              );
            }, 10000);

            it('should not send a click event to ATI or Optimizely when no link has been clicked', async () => {
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
                eventTracking: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              fetchMock.mock(
                'http://localhost/hindi/india-60426858/recommendations.json',
                hindiRecommendationsData.slice(0, 2),
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              await waitFor(
                () => {
                  const wsojClickCalls = sendEventBeacon.mock.calls.filter(
                    ([{ type }]) => type === 'click',
                  );
                  expect(wsojClickCalls.length).toBe(0);
                  const optimizelyClickCalls =
                    optimizely.track.mock.calls.filter(
                      ([eventName]) => eventName === 'component_clicks',
                    );
                  expect(optimizelyClickCalls.length).toBe(0);
                },
                { timeout: 2000 },
              );
            });

            it('should not send a click events when eventTracking is not enabled', async () => {
              const toggles = {
                cpsRecommendations: {
                  enabled: true,
                },
              };
              fetchMock.mock(
                'http://localhost/some-cps-sty-path.json',
                hindiPageData,
              );
              fetchMock.mock(
                'http://localhost/hindi/mostread.json',
                hindiMostRead,
              );
              fetchMock.mock(
                'http://localhost/hindi/india-60426858/recommendations.json',
                hindiRecommendationsData,
              );
              const { pageData } = await getInitialData({
                path: '/some-cps-sty-path',
                service: 'hindi',
                pageType,
              });

              const { getByText } = render(
                <PageWithContext
                  pageData={pageData}
                  service="hindi"
                  toggles={toggles}
                />,
              );

              const firstBlockRecommendationLink = getByText(
                'कोविड-19 महामारीः तो सबसे ज़्यादा मौतों की वजह वायरस नहीं होगा',
              );
              userEvent.click(firstBlockRecommendationLink);
              await waitFor(
                () => {
                  const wsojClickCalls = sendEventBeacon.mock.calls.filter(
                    ([{ type }]) => type === 'click',
                  );
                  expect(wsojClickCalls.length).toBe(0);
                  const optimizelyClickCalls =
                    optimizely.track.mock.calls.filter(
                      ([eventName]) => eventName === 'component_clicks',
                    );
                  expect(optimizelyClickCalls.length).toBe(0);
                },
                { timeout: 2000 },
              );
            });
          });
        });
      });

      describe('variation_3', () => {
        const forceMockVariation = variation =>
          OptimizelyExperiment.mockImplementation(props => {
            const { children } = props;

            if (children != null && typeof children === 'function') {
              return <>{children(variation, true, false)}</>;
            }

            return null;
          });

        afterAll(() => {
          jest.restoreAllMocks();
        });

        it('should render EOJ variation when showForVariation has variation_3 value ', async () => {
          forceMockVariation('variation_3');
          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/india-60426858/recommendations.json',
            hindiRecommendationsData,
          );
          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole, getByText } = render(
            <PageWithContext pageData={pageData} service="hindi" />,
          );

          const [eojRecommendations] = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'eoj-recommendations-heading',
          );

          expect(eojRecommendations).toBeInTheDocument();

          expect(
            getByText(
              'कोविड-19 महामारीः तो सबसे ज़्यादा मौतों की वजह वायरस नहीं होगा',
            ),
          ).toBeInTheDocument();
          expect(
            getByText('कोरोना से मिले कौन से सबक़ हम याद रखेंगे?'),
          ).toBeInTheDocument();
          expect(
            getByText('कोविड-19 के बाद हमारी यात्राएं कैसी होंगी?'),
          ).toBeInTheDocument();
        });

        it('should not render EOJ variation when showForVariation is not variation_3 ', async () => {
          forceMockVariation('control');
          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/india-60426858/recommendations.json',
            hindiRecommendationsData,
          );
          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <PageWithContext pageData={pageData} service="hindi" />,
          );

          const [eojRecommendations] = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'eoj-recommendations-heading',
          );

          expect(eojRecommendations).toBe(undefined);
        });
      });
    });
  });
});
