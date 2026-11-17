// Stay below Vercel's request-body limit after base64 + JSON encoding.
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_REQUEST_BYTES = 3 * 1024 * 1024;
export const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
