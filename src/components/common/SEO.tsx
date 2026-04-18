import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'profile' | 'article';
  schema?: object;
}

export function SEO({
  title = "Nimart - Nigeria's Trusted Service Marketplace",
  description = "Connect with verified professionals across Nigeria. Book trusted services for home, auto, beauty, and more.",
  image = "/og-image.png",
  url = "https://nimart.ng",
  type = "website",
  schema,
}: SEOProps) {
  const fullTitle = title.includes('Nimart') ? title : `${title} | Nimart`;
  const imageUrl = image.startsWith('http') ? image : `https://nimart.ng${image}`;

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Nimart" />
      <meta property="og:locale" content="en_NG" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@nimartng" />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}