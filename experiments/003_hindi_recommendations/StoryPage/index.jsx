/* eslint-disable */

const componentsToRender = {
  // ...rest of componentsToRender
  experimentBlock: props => {
    const { showForVariation } = props;

    return (
      <OptimizelyExperiment experiment={OPTIMIZELY_CONFIG.experimentId}>
        {variation => {
          // Return 'control' variation if 'control' is returned from Optimizely or experiment is not enabled
          if (
            showForVariation === 'control' &&
            (variation === 'control' || !variation)
          ) {
            return (
              <CpsRecommendations
                {...props}
                parentColumns={gridColsMain}
                items={recommendationsData}
                showForVariation={showForVariation}
              />
            );
          }

          if (
            showForVariation === 'variation_1' &&
            variation === 'variation_1'
          ) {
            return (
              <SplitRecommendations {...props} items={recommendationsData} />
            );
          }

          if (
            showForVariation === 'variation_3' &&
            variation === 'variation_3'
          ) {
            return <ExperimentalEOJ {...props} blocks={recommendationsData} />;
          }

          return null;
        }}
      </OptimizelyExperiment>
    );
  },
};
