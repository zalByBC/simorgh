import React from 'react';
import pathOr from 'ramda/src/pathOr';
import { string, number } from 'prop-types';
import { textDefaultPropTypes } from '#models/propTypes';
import { headlineModelPropTypes } from '#models/propTypes/headline';
import idSanitiser from '#lib/utilities/idSanitiser';
import { GridItemMedium, GridItemLarge } from '#components/Grid';
import HeadingComponent from '#app/components/Heading';
import styles from './index.styles';
import Fragment from '../Fragment';
import InlineContainer from '../InlineContainer';
import Blocks from '../Blocks';

const GridItems = {
  headline: GridItemLarge,
  subheadline: GridItemMedium,
};

const sanitiseSubheadline = (type, text) => {
  if (text && type === 'subheadline') {
    return idSanitiser(text);
  }
  return null;
};

const HeadingsContainer = ({
  blocks,
  type,
  headingLevel,
  fontVariant,
  size,
}) => {
  const GridItem = GridItems[type];

  const arrayOfFragments = blocks[0].model.blocks[0].model.blocks;
  const isFirstBlock = pathOr(1, ['position', 0])(blocks[0]) === 1;

  if (!arrayOfFragments || !Array.isArray(arrayOfFragments)) {
    return null;
  }
  const { text } = blocks[0].model.blocks[0].model;
  const componentsToRender = { fragment: Fragment, inline: InlineContainer };

  const renderText = () => (
    <Blocks blocks={arrayOfFragments} componentsToRender={componentsToRender} />
  );

  const headingId = isFirstBlock ? 'content' : null; // Used for the skiplink
  const subHeadingId = sanitiseSubheadline(type, text);
  const isHeading = type === 'headline';
  const isFirstHeading = isHeading && isFirstBlock;
  const isPostHeading = headingLevel === 3;

  const headingProps = {
    headline: {
      id: headingId,
      ...(!isFirstHeading && { as: 'strong' }),
      tabIndex: isHeading && !isFirstBlock ? null : '-1',
      level: headingLevel || 1,
      fontVariant: fontVariant || 'serifMedium',
      size: size || null,
    },
    subheadline: {
      id: subHeadingId,
      tabIndex: isHeading && !isFirstBlock ? null : '-1',
      level: headingLevel || 2,
      fontVariant: fontVariant || 'sansBold',
      size: size || null,
    },
  };

  const getHeadingCss = () => {
    const itemCss = [];

    if (isHeading && !isPostHeading) {
      itemCss.push(styles.headline);
    } else if (isPostHeading && isHeading) {
      itemCss.push(styles.postHeading);
    } else if (isPostHeading && !isHeading) {
      itemCss.push(styles.postSubHeading);
    } else {
      itemCss.push(styles.subHeading);
    }

    return itemCss;
  };

  return (
    <GridItem>
      <HeadingComponent
        // replace with better logic?
        css={getHeadingCss()}
        {...headingProps[type]}
      >
        {renderText()}
      </HeadingComponent>
    </GridItem>
  );
};

HeadingsContainer.propTypes = {
  ...headlineModelPropTypes,
  type: string.isRequired,
  headingLevel: number,
};

HeadingsContainer.defaultProps = textDefaultPropTypes;

export default HeadingsContainer;
