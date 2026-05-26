module.exports = {
  source: "dist",
  exclude: [
    "/admin/*",
    "/auth/*",
    "/customer/*",
    "/provider/*",
    "/receipt/*"
  ],
  include: [
    "/provider/2a91ff11-19a1-49ea-9af1-ad2a7d6cc1d9",
    "/provider/7a1b0418-33fe-4c53-8916-183bcfc53651"
  ],
  minifyHtml: true,
  skipThirdPartyRequests: true
};