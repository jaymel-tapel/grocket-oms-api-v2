export function extractPublicIdFromUrl(url: string) {
  const regex = /\/[^/]*$/;
  const match = url.match(regex);
  if (match) {
    const publicIdWithExtension = match[0].substring(1); // Remove the leading '/'
    const publicId = publicIdWithExtension.split('.')[0]; // Remove the file extension
    return publicId;
  }
  return null;
}
