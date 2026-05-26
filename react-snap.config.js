module.exports = {
  // Exclude pages that require authentication or are admin/customer/provider dashboards
  exclude: [
    "/admin/*",
    "/auth/*",
    "/customer/*",
    "/provider/*",
    "/receipt/*"
  ],
  // Pre-render these specific provider pages (add more as needed)
  include: [
    "/provider/2a91ff11-19a1-49ea-9af1-ad2a7d6cc1d9",
    "/provider/7a1b0418-33fe-4c53-8916-183bcfc53651"
  ],
  // Minify the generated HTML to reduce file size
  minifyHtml: true,
  // Disable service worker registration during pre-rendering
  skipThirdPartyRequests: true
};