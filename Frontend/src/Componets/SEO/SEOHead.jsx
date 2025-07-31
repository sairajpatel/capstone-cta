import React from 'react';
import { Helmet } from 'react-helmet-async';
import { generateSEOConfig, generateStructuredData } from '../../utils/seoUtils';

const SEOHead = ({ 
  pageConfig, 
  structuredData = null,
  additionalMeta = {} 
}) => {
  const seoConfig = generateSEOConfig(pageConfig);
  
  // Generate structured data if not provided
  const finalStructuredData = structuredData || generateStructuredData('WebPage', {
    name: seoConfig.title,
    description: seoConfig.description,
    url: seoConfig.ogUrl,
    breadcrumb: {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://gatherguru.ca/"
        }
      ]
    }
  });

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoConfig.title}</title>
      <meta name="description" content={seoConfig.description} />
      <meta name="keywords" content={seoConfig.keywords} />
      <meta name="author" content={seoConfig.author} />
      <meta name="robots" content={seoConfig.robots} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seoConfig.ogType} />
      <meta property="og:url" content={seoConfig.ogUrl} />
      <meta property="og:title" content={seoConfig.ogTitle} />
      <meta property="og:description" content={seoConfig.ogDescription} />
      <meta property="og:image" content={seoConfig.ogImage} />
      <meta property="og:image:width" content={seoConfig.ogImageWidth} />
      <meta property="og:image:height" content={seoConfig.ogImageHeight} />
      <meta property="og:site_name" content={seoConfig.ogSiteName} />
      <meta property="og:locale" content={seoConfig.ogLocale} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={seoConfig.twitterCard} />
      <meta name="twitter:url" content={seoConfig.twitterUrl} />
      <meta name="twitter:title" content={seoConfig.twitterTitle} />
      <meta name="twitter:description" content={seoConfig.twitterDescription} />
      <meta name="twitter:image" content={seoConfig.twitterImage} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content={seoConfig.themeColor} />
      <meta name="msapplication-TileColor" content={seoConfig.msTileColor} />
      <meta name="apple-mobile-web-app-capable" content={seoConfig.appleMobileWebAppCapable} />
      <meta name="apple-mobile-web-app-status-bar-style" content={seoConfig.appleMobileWebAppStatusBarStyle} />
      <meta name="apple-mobile-web-app-title" content={seoConfig.appleMobileWebAppTitle} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoConfig.canonicalUrl} />
      
      {/* Additional Meta Tags */}
      {Object.entries(additionalMeta).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead; 