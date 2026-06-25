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

const BUYING_GUIDE_FAQ = {
  '/buying-guides/best-sectional-sofas': [
    {
      '@type': 'Question',
      name: 'What types of sectional sofas does Havertys carry?',
      acceptedAnswer: { '@type': 'Answer', text: 'Havertys carries L-shaped, U-shaped, modular, reclining, leather, and fabric sectionals. Many feature USB ports, hidden cupholders, and power reclining. Configurations range from compact apartment sizes to large family room U-shapes.' },
    },
    {
      '@type': 'Question',
      name: 'Does Havertys offer free design help for choosing a sectional?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every Havertys purchase includes a free Design Consultation with a certified Design Expert, in-store or virtually, plus access to a free 3D Room Planner tool.' },
    },
    {
      '@type': 'Question',
      name: 'How does Havertys compare to Ashley Furniture for sectionals?',
      acceptedAnswer: { '@type': 'Answer', text: 'Havertys focuses on mid-to-upper-tier quality with longer-lasting materials and free personalized design service included with every purchase. Every Havertys customer gets a Design Expert and Regret-Free Guarantee at no extra cost.' },
    },
    {
      '@type': 'Question',
      name: 'Does Havertys have reclining sectionals?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Havertys offers power reclining sectionals with USB charging ports, manual reclining sectionals, and sectionals with reclining chaise lounges, many with hidden cupholders and adjustable headrests.' },
    },
    {
      '@type': 'Question',
      name: 'Can I customize my Havertys sectional?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Many collections offer multiple fabric and leather options, configuration choices, and custom fabric selection. A Havertys Design Expert can walk you through all options at no charge.' },
    },
  ],
};

function buildFAQSchema() {
  const path = window.location.pathname.replace(/\/$/, '');
  const staticQuestions = BUYING_GUIDE_FAQ[path];
  if (staticQuestions) {
    return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: staticQuestions };
  }

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
