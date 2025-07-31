// SEO Utility functions for GatherGuru

export const defaultSEOConfig = {
  title: "GatherGuru - Discover Amazing Events Near You",
  description: "Explore and discover the best events, concerts, workshops, and gatherings in your area. Find local events, book tickets, and never miss out on amazing experiences with GatherGuru's comprehensive event discovery platform.",
  keywords: "events, concerts, workshops, local events, event booking, tickets, gatherings, entertainment, music, corporate events, weddings, birthday parties, conferences, seminars, networking events, cultural festivals, sports events, theater plays, comedy shows, food festivals",
  author: "GatherGuru",
  siteName: "GatherGuru",
  baseUrl: "https://gatherguru.ca",
  defaultImage: "https://gatherguru.ca/og-default-image.jpg",
  twitterImage: "https://gatherguru.ca/twitter-default-image.jpg"
};

export const generateSEOConfig = (pageConfig) => {
  const config = {
    ...defaultSEOConfig,
    ...pageConfig
  };

  return {
    // Primary Meta Tags
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    author: config.author,
    robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    
    // Open Graph / Facebook
    ogType: "website",
    ogUrl: config.url || config.baseUrl,
    ogTitle: config.title,
    ogDescription: config.description,
    ogImage: config.ogImage || config.defaultImage,
    ogImageWidth: "1200",
    ogImageHeight: "630",
    ogSiteName: config.siteName,
    ogLocale: "en_US",
    
    // Twitter
    twitterCard: "summary_large_image",
    twitterUrl: config.url || config.baseUrl,
    twitterTitle: config.title,
    twitterDescription: config.description,
    twitterImage: config.twitterImage || config.defaultImage,
    
    // Additional
    themeColor: "#1C1B29",
    msTileColor: "#1C1B29",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black-translucent",
    appleMobileWebAppTitle: config.siteName,
    canonicalUrl: config.url || config.baseUrl
  };
};

export const pageConfigs = {
  dashboard: {
    title: "GatherGuru - Discover Amazing Events Near You | Event Discovery Platform",
    description: "Explore and discover the best events, concerts, workshops, and gatherings in your area. Find local events, book tickets, and never miss out on amazing experiences with GatherGuru's comprehensive event discovery platform.",
    url: "https://gatherguru.ca/user/dashboard",
    ogImage: "https://gatherguru.ca/og-dashboard-image.jpg",
    twitterImage: "https://gatherguru.ca/twitter-dashboard-image.jpg"
  },
  events: {
    title: "Explore Events - GatherGuru | Find Local Events Near You",
    description: "Browse and discover amazing events in your area. From concerts and workshops to corporate events and cultural festivals, find the perfect event for you.",
    url: "https://gatherguru.ca/events",
    ogImage: "https://gatherguru.ca/og-events-image.jpg",
    twitterImage: "https://gatherguru.ca/twitter-events-image.jpg"
  },
  about: {
    title: "About Us - GatherGuru | Connecting People Through Events",
    description: "Learn about GatherGuru's mission to connect people through amazing events. Discover how we're revolutionizing event discovery and booking.",
    url: "https://gatherguru.ca/about",
    ogImage: "https://gatherguru.ca/og-about-image.jpg",
    twitterImage: "https://gatherguru.ca/twitter-about-image.jpg"
  },
  contact: {
    title: "Contact Us - GatherGuru | Get in Touch",
    description: "Get in touch with the GatherGuru team. We're here to help with any questions about events, bookings, or our platform.",
    url: "https://gatherguru.ca/contact",
    ogImage: "https://gatherguru.ca/og-contact-image.jpg",
    twitterImage: "https://gatherguru.ca/twitter-contact-image.jpg"
  }
};

export const generateStructuredData = (type, data) => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": type
  };

  switch (type) {
    case "WebPage":
      return {
        ...baseData,
        name: data.name,
        description: data.description,
        url: data.url,
        mainEntity: {
          "@type": "WebSite",
          name: "GatherGuru",
          url: "https://gatherguru.ca/",
          description: "Event discovery and booking platform",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://gatherguru.ca/events?query={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        },
        breadcrumb: data.breadcrumb
      };
    
    case "Event":
      return {
        ...baseData,
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        location: {
          "@type": "Place",
          name: data.location?.name || "Event Location",
          address: data.location?.address
        },
        organizer: {
          "@type": "Organization",
          name: data.organizer?.name || "Event Organizer"
        },
        offers: data.offers,
        eventStatus: data.eventStatus || "https://schema.org/EventScheduled"
      };
    
    case "Organization":
      return {
        ...baseData,
        name: data.name,
        description: data.description,
        url: data.url,
        logo: data.logo
      };
    
    default:
      return baseData;
  }
}; 