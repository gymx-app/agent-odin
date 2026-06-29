export const REQUEST_BODY_LIMITS = {
  default: 64 * 1024,
  generate: 8 * 1024,
  preview: 64 * 1024,
  profile: 64 * 1024,
  // base64-encoded InBody scan: PDF ~2 MB → ~2.7 MB base64 + JSON overhead
  inbodyParse: 10 * 1024 * 1024,
} as const;
