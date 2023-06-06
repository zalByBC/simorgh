import React from 'react';
import styled from '@emotion/styled';
import { number, bool, objectOf, string } from 'prop-types';
import {
  BBC_BLOCKS,
  BBC_BLOCKS_DARK_MODE,
} from '#psammead/psammead-assets/src/svgs';
import {
  GEL_GROUP_2_SCREEN_WIDTH_MIN,
  GEL_GROUP_4_SCREEN_WIDTH_MIN,
} from '#psammead/gel-foundations/src/breakpoints';

export { default as ImagePlaceholderAmp } from './index.amp';

const bgImageDark = `url(data:image/svg+xml;base64,${BBC_BLOCKS_DARK_MODE})`;
const bgImageRegular = `url(data:image/svg+xml;base64,${BBC_BLOCKS})`;

const StyledImagePlaceholder = styled.div`
  position: relative;
  height: 0;
  overflow: hidden;
  background-color: ${({ darkPlaceholder }) =>
    props =>
      darkPlaceholder
        ? props.theme.palette.GREY_7
        : props.theme.palette.GREY_2};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 60px 17px;
  @media (min-width: ${GEL_GROUP_2_SCREEN_WIDTH_MIN}) {
    background-size: 77px 22px;
  }
  @media (min-width: ${GEL_GROUP_4_SCREEN_WIDTH_MIN}) {
    background-size: 93px 27px;
  }
  width: 100%;
  background-image: ${({ darkPlaceholder }) =>
    darkPlaceholder ? bgImageDark : bgImageRegular};
`;

const ImagePlaceholder = props => {
  const { forwardStyle, ratio } = props;

  return (
    <StyledImagePlaceholder
      style={{ paddingBottom: `${ratio}%`, ...(forwardStyle || []) }}
      data-e2e="image-placeholder"
      {...props}
    />
  );
};

ImagePlaceholder.propTypes = {
  ratio: number.isRequired,
  darkPlaceholder: bool,
  forwardStyle: objectOf(string),
};

ImagePlaceholder.defaultProps = {
  darkPlaceholder: false,
  forwardStyle: null,
};

export default ImagePlaceholder;
