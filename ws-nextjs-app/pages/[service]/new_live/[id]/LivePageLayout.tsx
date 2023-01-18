/** @jsxRuntime classic */
/** @jsx jsx */

import React, { useContext } from 'react';
import { jsx } from '@emotion/react';
import Image from 'next/image';
import MetadataContainer from '#app/legacy/containers/Metadata';
import LinkedDataContainer from '#app/legacy/containers/LinkedData';
import Pagination from '#pages/TopicPage/Pagination';
import Heading from '#app/components/Heading';
import { ServiceContext } from '#contexts/ServiceContext';

import styles from './styles';

type ComponentProps = {
  bbcOrigin?: string;
  pageData: {
    pageCount: number;
    activePage: number;
    curations: {
      summaries: {
        imageUrl: string;
        imageAlt: string;
      }[];
    }[];
  };
  showAdsBasedOnLocation: boolean;
};

const LivePage = ({
  bbcOrigin,
  pageData,
  showAdsBasedOnLocation,
}: ComponentProps) => {
  const { lang } = useContext(ServiceContext);
  const { pageCount, activePage } = pageData;

  return (
    <>
      <MetadataContainer
        title="Test Live Page"
        lang={lang}
        description="A test Live Page using Next.JS"
        openGraphType="website"
        hasAmpPage={false}
      />
      <LinkedDataContainer type="CollectionPage" seoTitle="Test Live Page" />

      <main css={styles.wrapper}>
        <Heading level={1}>Test Next.JS Page</Heading>
        <pre css={styles.code}>
          <Heading level={4}>Headers</Heading>
          {bbcOrigin && (
            <p>
              bbc-origin: <span>{bbcOrigin}</span>
            </p>
          )}
          <p>
            bbc-adverts:{' '}
            <span>{showAdsBasedOnLocation ? 'true' : 'false'}</span>
          </p>
        </pre>
        <pre css={styles.code}>
          <Heading level={4}>next/image component</Heading>
          <div css={styles.imageTestWrapper}>
            <Image
              alt={pageData?.curations?.[0].summaries?.[0].imageAlt}
              src={pageData?.curations?.[0].summaries?.[0].imageUrl?.replace(
                '{width}',
                '640',
              )}
              layout="fill"
              objectFit="cover"
            />
          </div>
        </pre>
        <pre css={styles.code}>{JSON.stringify(pageData, null, 2)}</pre>
        <Pagination
          activePage={activePage}
          pageCount={pageCount}
          pageXOfY="Page {x} of {y}"
          previousPage="Previous Page"
          nextPage="Next Page"
          page="Page"
        />
      </main>
    </>
  );
};

export default LivePage;
