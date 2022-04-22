# Hindi Recommendations Experiment

[More information on purpose of experiment](https://paper.dropbox.com/doc/003-Hindi-Recommendations-Experiment-Brief--BgH87qcMcfYfkPhfxG_iRb9UAg-jBmdtlPaaXhX1CwFl3g24)

## Implementation

### addExperimentPlaceholderBlocks

This function adds placeholder blocks to the `pageData` object used within our pages. This block can then be read by a page component to render out an `experimentBlock`. Anything can be added within the `model` object. In this case, we use a `showForVariation` value to determine if the experiment block should be shown for a particular Optimizely variation. We also use an `insertIndex` value to determine where the experiment block should be inserted within the `pageData`:

```
    {
      block: {
        type: 'experimentBlock',
        model: {
          showForVariation: 'control',
        },
      },
      insertIndex: 5,
    }
```

### ExperimentalEOJ

This component is a direct copy of the ScrollablePromo component. This experimental version of the component contained additional metadata to render out the title of the onward journey, as well as Optimizely view / click event tracking

### SplitRecommendations

This component houses some logic to render out 2 copies of the `<CpsRecommendations />` component. The recommendations are split into 2 halves and then a check is applied to render each half at certain points within the article, using the `experimentBlock` metadata mentioned above.

### StoryPage

This component is used to render CPS articles. For this experiment, we updated the `componentsToRender` object to check for the new `experimentBlock` type mentioned above. We made use of the built-in `<OptimizelyExperiment />` component to render the different variations of the onward journey components.
