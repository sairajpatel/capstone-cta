import React, { useEffect } from 'react';
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

  useEffect(() => {
    // Update document title
    document.title = seoConfig.title;

    // Create or update meta tags
    const updateMetaTag = (name, content, property = false) => {
      let meta = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Primary Meta Tags
    updateMetaTag('description', seoConfig.description);
    updateMetaTag('keywords', seoConfig.keywords);
    updateMetaTag('author', seoConfig.author);
    updateMetaTag('robots', seoConfig.robots);
    
    // Open Graph / Facebook
    updateMetaTag('og:type', seoConfig.ogType, true);
    updateMetaTag('og:url', seoConfig.ogUrl, true);
    updateMetaTag('og:title', seoConfig.ogTitle, true);
    updateMetaTag('og:description', seoConfig.ogDescription, true);
    updateMetaTag('og:image', seoConfig.ogImage, true);
    updateMetaTag('og:image:width', seoConfig.ogImageWidth, true);
    updateMetaTag('og:image:height', seoConfig.ogImageHeight, true);
    updateMetaTag('og:site_name', seoConfig.ogSiteName, true);
    updateMetaTag('og:locale', seoConfig.ogLocale, true);
    
    // Twitter
    updateMetaTag('twitter:card', seoConfig.twitterCard);
    updateMetaTag('twitter:url', seoConfig.twitterUrl);
    updateMetaTag('twitter:title', seoConfig.twitterTitle);
    updateMetaTag('twitter:description', seoConfig.twitterDescription);
    updateMetaTag('twitter:image', seoConfig.twitterImage);
    
    // Additional SEO Meta Tags
    updateMetaTag('theme-color', seoConfig.themeColor);
    updateMetaTag('msapplication-TileColor', seoConfig.msTileColor);
    updateMetaTag('apple-mobile-web-app-capable', seoConfig.appleMobileWebAppCapable);
    updateMetaTag('apple-mobile-web-app-status-bar-style', seoConfig.appleMobileWebAppStatusBarStyle);
    updateMetaTag('apple-mobile-web-app-title', seoConfig.appleMobileWebAppTitle);
    
    // Additional Meta Tags
    Object.entries(additionalMeta).forEach(([name, content]) => {
      updateMetaTag(name, content);
    });

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seoConfig.canonicalUrl);

    // Update structured data
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(finalStructuredData);

    // Cleanup function
    return () => {
      // Optionally clean up meta tags when component unmounts
      // This is optional as new meta tags will override old ones
    };
  }, [seoConfig, finalStructuredData, additionalMeta]);

  // This component doesn't render anything visible
  return null;
};

export default SEOHead; 