import React from 'react';
import Helmet from 'react-helmet';
import { useLocation } from '@reach/router';
import I18n, { TRoute } from '../i18n';
import { ISituationQuestions_Answers } from '@graphql-types';

const BASE_URL = 'https://covid.gov.cz';

interface IProps {
  body?: string;
  langCode: string;
  datePublished?: string;
  dateModified?: string;
  description: string;
  isBlogPost: boolean;
  isBlogList?: boolean;
  isSpecialList?: boolean;
  title: string;
  isHomePage?: boolean;
  breadcrumbItems?: Array<Object | string>;
  questions_answers?: ISituationQuestions_Answers[];
}

export const SchemaComp: React.FC<IProps> = ({
  datePublished,
  dateModified,
  description,
  isBlogPost,
  isBlogList,
  isSpecialList,
  title,
  langCode,
  body,
  isHomePage,
  breadcrumbItems,
  questions_answers,
}) => {
  const { pathname } = useLocation();
  const url = `${BASE_URL}${pathname}`;

  const websiteUrl = `${BASE_URL}${TRoute('/')}`;

  const baseSchema = [
    {
      '@context': 'http://schema.org',
      '@type': 'WebSite',
      url: websiteUrl,
      name: langCode === 'en' ? 'Covid Portal' : 'Covid Portál',
      inLanguage: langCode === 'en' ? 'en-GB' : 'cs-CZ',
    },
    {
      '@context': 'http://schema.org',
      '@type': 'WebPage',
      url,
      name: title,
      inLanguage: langCode === 'en' ? 'en-GB' : 'cs-CZ',
    },
  ];

  const breadcrumbItemsList: Array<Object> = [];
  let breadcrumbItemsListIter = 1;
  if (typeof breadcrumbItems !== 'undefined') {
    breadcrumbItems.forEach(
      (breadcrumbItem: { url: string; title: string }) => {
        if (typeof breadcrumbItem !== 'string') {
          breadcrumbItemsList.push({
            '@type': 'ListItem',
            position: breadcrumbItemsListIter,
            item: {
              '@id': `${BASE_URL}${breadcrumbItem.url}`,
              name: breadcrumbItem.title,
            },
          });
          breadcrumbItemsListIter++;
        }
      },
    );
    if (!isSpecialList) {
      breadcrumbItemsList.push({
        '@type': 'ListItem',
        position: breadcrumbItemsListIter++,
        item: {
          '@id': url,
          name: title,
        },
      });
    }
  } else {
    breadcrumbItemsList.push({
      '@type': 'ListItem',
      position: breadcrumbItemsListIter,
      item: {
        '@id': url,
        name: title,
      },
    });
  }

  if (typeof dateModified === 'undefined') {
    dateModified = datePublished || null;
  }

  let faqList = null;
  if (typeof questions_answers !== 'undefined') {
    faqList = [];
    questions_answers.forEach((questions_answer) => {
      faqList.push({
        '@type': 'Question',
        name: questions_answer.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: questions_answer.value,
        },
      });
    });
  }

  const schema =
    isBlogPost || isBlogList || isSpecialList
      ? [
          ...baseSchema,
          {
            '@context': 'http://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbItemsList,
          },
          isBlogPost && faqList !== null && faqList.length > 0
            ? {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqList,
              }
            : '',
          isBlogPost
            ? {
                '@context': 'http://schema.org',
                '@type': 'BlogPosting',
                mainEntityOfPage: {
                  '@type': 'WebPage',
                  '@id': url,
                },
                headline: title,
                image: `${BASE_URL}/images/ogimage.jpg`,
                datePublished,
                dateModified,
                publisher: {
                  '@type': 'Organization',
                  url: 'https://gov.cz',
                  logo: 'https://gov.cz/images/layout/pvs-logo-mobile.svg',
                  name: 'Gov.cz',
                },
                author: {
                  '@type': 'Organization',
                  url: 'https://gov.cz',
                  logo: 'https://gov.cz/images/layout/pvs-logo-mobile.svg',
                  name: 'Gov.cz',
                },
              }
            : '',
        ]
      : baseSchema;

  const ogTitle = isHomePage ? title : `${title} · ${I18n('covid_portal')}`;

  const { origin } = new URL(url);

  return (
    <Helmet htmlAttributes={{ lang: langCode }}>
      <meta property="og:url" content={url} />
      <meta property="og:title" content={ogTitle} />
      <meta
        property="og:locale"
        content={langCode === 'en' ? 'en_GB' : 'cs_CZ'}
      />
      {isBlogPost ? (
        <meta property="og:type" content="article" />
      ) : (
        <meta property="og:type" content="website" />
      )}
      <meta property="og:image" content={`${origin}/images/ogimage.jpg`} />
      <meta property="twitter:image" content={`${origin}/images/ogimage.jpg`} />
      <meta property="og:description" content={description} />
      <meta name="description" content={description} />
      <meta property="og:site_name" content={I18n('covid_portal')} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default SchemaComp;
