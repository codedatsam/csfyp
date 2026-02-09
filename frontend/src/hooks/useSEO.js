// ==========================================
// USE SEO HOOK
// ==========================================
// Manages dynamic page titles and meta tags
// ==========================================

import { useEffect } from 'react';

const DEFAULT_TITLE = 'Husleflow - Book Local Services';
const DEFAULT_DESCRIPTION = 'Find and book trusted local service providers instantly. Hair, beauty, fitness, tutoring and more across the UK.';

export function useSEO({ 
  title, 
  description = DEFAULT_DESCRIPTION,
  keywords = '',
  noIndex = false 
}) {
  useEffect(() => {
    // Update title
    const fullTitle = title ? `${title} | Husleflow` : DEFAULT_TITLE;
    document.title = fullTitle;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Update Open Graph title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }
    
    // Update Open Graph description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }
    
    // Update Twitter title
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', fullTitle);
    }
    
    // Update Twitter description
    let twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description);
    }
    
    // Handle noIndex
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow');
    }
    
    // Cleanup - restore defaults when component unmounts
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, keywords, noIndex]);
}

export default useSEO;
