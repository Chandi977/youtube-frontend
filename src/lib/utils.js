const isCloudinaryUrl = (url) =>
  typeof url === "string" && url.includes("res.cloudinary.com") && url.includes("/upload/");

const buildCloudinaryUrl = (url, transform) => {
  if (!isCloudinaryUrl(url)) return url;
  const httpsUrl = url.startsWith("http://") ? url.replace("http://", "https://") : url;
  const [prefix, suffix] = httpsUrl.split("/upload/");
  const transformation = transform ? `${transform},f_auto,q_auto` : "f_auto,q_auto";
  return `${prefix}/upload/${transformation}/${suffix}`;
};

export const secureUrl = (url) => buildCloudinaryUrl(url, "");

export const getCloudinarySrcSet = (url, widths = [320, 480, 640, 960, 1280]) => {
  if (!isCloudinaryUrl(url)) return undefined;
  return widths
    .map((w) => `${buildCloudinaryUrl(url, `w_${w}`)} ${w}w`)
    .join(", ");
};
