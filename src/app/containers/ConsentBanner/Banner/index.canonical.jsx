import React, { useContext, useEffect } from 'react';
import styled from '@emotion/styled';
import { func, string, oneOfType, shape, any } from 'prop-types';
import { ConsentBanner } from '@bbc/psammead-consent-banner';
import { ServiceContext } from '#contexts/ServiceContext';
import BannerText from './Text';
import getDataAttribute from './getDataAttribute';

// Styles to pin the consent banner to the bottom of the view port
// The z-index ensures the banner is always at the front, the value
// being the max value for an integer, this avoiding issues where includes
// use high z-indexes, showing in front of the consent banner:
// https://github.com/bbc/simorgh/issues/8720
const ConsentBannerWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2147483647;
`;

const Accept = (message, onClick, dataAttribute) => {
  return (
    <button onClick={onClick} type="button" {...dataAttribute}>
      {message}
    </button>
  );
};

const Reject = (message, href, onClick, dataAttribute) => {
  return (
    <a href={href} onClick={onClick} {...dataAttribute}>
      {message}
    </a>
  );
};

const CanonicalConsentBannerContainer = ({
  type,
  onReject,
  onAccept,
  consentBannerRef,
}) => {
  const { dir, translations, script, service } = useContext(ServiceContext);
  const consentBannerConfig = translations.consentBanner[type];

  const dataAttribute = getDataAttribute(type);

  useEffect(() => {
    consentBannerRef.current.focus();
  });

  return (
    <ConsentBannerWrapper>
      <ConsentBanner
        dir={dir}
        title={consentBannerConfig.title}
        text={BannerText(consentBannerConfig.description)}
        accept={Accept(
          consentBannerConfig.accept,
          onAccept,
          dataAttribute('accept'),
        )}
        reject={Reject(
          consentBannerConfig.reject,
          consentBannerConfig.rejectUrl,
          onReject,
          dataAttribute('reject'),
        )}
        script={script}
        service={service}
        focusRef={consentBannerRef}
      />
    </ConsentBannerWrapper>
  );
};

CanonicalConsentBannerContainer.propTypes = {
  type: string.isRequired,
  onReject: func.isRequired,
  onAccept: func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  consentBannerRef: oneOfType([func, shape({ current: any })]),
};

CanonicalConsentBannerContainer.defaultProps = {
  consentBannerRef: null,
};

export default CanonicalConsentBannerContainer;
