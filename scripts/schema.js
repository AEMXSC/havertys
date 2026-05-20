function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: 'Havertys',
    url: 'https://www.havertys.com',
    logo: 'https://main--havertys--aemxsc.aem.live/icons/header-logo.svg',
    description: 'Havertys creates quality furniture specifically for you and your vision of home. Over 125 stores in 17 states.',
    foundingDate: '1885',
    founder: {
      '@type': 'Person',
      name: 'J.J. Haverty',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '780 Johnson Ferry Road, NE, Suite 800',
      addressLocality: 'Atlanta',
      addressRegion: 'GA',
      postalCode: '30342',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-888-428-3789',
      contactType: 'customer service',
      availableLanguage: 'English',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '19:00',
      },
    },
    sameAs: [
      'http://www.facebook.com/Havertys',
      'https://www.instagram.com/havertysfurniture',
      'http://www.youtube.com/user/Havertys',
      'http://www.pinterest.com/havertys',
    ],
  };
}

function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Havertys',
    url: window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${window.location.origin}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function buildBreadcrumbSchema() {
  const path = window.location.pathname;
  if (path === '/' || path === '') return null;

  const parts = path.split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin }];

  let currentPath = '';
  parts.forEach((part, i) => {
    currentPath += `/${part}`;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      item: `${window.location.origin}${currentPath}`,
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function buildFAQSchema() {
  const accordionItems = document.querySelectorAll('.accordion details, .accordion [role="group"]');
  if (accordionItems.length === 0) return null;

  const questions = [];
  accordionItems.forEach((item) => {
    const q = item.querySelector('summary, h3, [role="button"]');
    const a = item.querySelector('.accordion-item-body, details > div:last-child, summary ~ *');
    if (q && a) {
      questions.push({
        '@type': 'Question',
        name: q.textContent.trim(),
        acceptedAnswer: {
          '@type': 'Answer',
          text: a.textContent.trim(),
        },
      });
    }
  });

  if (questions.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions,
  };
}

export default function addSchemaData() {
  const schemas = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildBreadcrumbSchema(),
    buildFAQSchema(),
  ].filter(Boolean);

  schemas.forEach((schema) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}
