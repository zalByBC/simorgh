import {
  VisualStyle,
  VisualProminence,
  VISUAL_STYLE,
  VISUAL_PROMINENCE,
} from '#app/models/types/curationData';

export const COMPONENT_NAMES = {
  MESSAGE_BANNER: 'message-banner',
  SIMPLE_CURATION_GRID: 'simple-curation-grid',
  HIERARCHICAL_CURATION_GRID: 'hierarchical-curation-grid',
  NOT_SUPPORTED: 'not-supported',
  MOST_READ: 'most-read',
} as const;

const { NONE, BANNER, COLLECTION, RANKED } = VISUAL_STYLE;
const { MINIMUM, LOW, NORMAL, HIGH, MAXIMUM } = VISUAL_PROMINENCE;
const {
  MESSAGE_BANNER,
  SIMPLE_CURATION_GRID,
  HIERARCHICAL_CURATION_GRID,
  MOST_READ,
  NOT_SUPPORTED,
} = COMPONENT_NAMES;

export default (
  visualStyle: VisualStyle,
  visualProminence: VisualProminence,
) => {
  const componentsByVisualStyleAndProminence = {
    [`${BANNER}_${MINIMUM}`]: NOT_SUPPORTED,
    [`${BANNER}_${LOW}`]: NOT_SUPPORTED,
    [`${BANNER}_${NORMAL}`]: MESSAGE_BANNER,
    [`${BANNER}_${HIGH}`]: NOT_SUPPORTED,
    [`${BANNER}_${MAXIMUM}`]: NOT_SUPPORTED,
    [`${NONE}_${NORMAL}`]: SIMPLE_CURATION_GRID,
    [`${NONE}_${HIGH}`]: HIERARCHICAL_CURATION_GRID,
    [`${COLLECTION}_${HIGH}`]: HIERARCHICAL_CURATION_GRID,
    [`${RANKED}_${NORMAL}`]: MOST_READ,
  };

  const visualStyleAndProminence = `${visualStyle}_${visualProminence}`;

  return componentsByVisualStyleAndProminence[visualStyleAndProminence] || null;
};
