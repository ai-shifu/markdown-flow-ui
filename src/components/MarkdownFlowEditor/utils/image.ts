const imageUrlPattern =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[^\s]+)/i;

export const isValidImageUrl = (url: string) => {
  if (!url) return false;
  const trimmed = url.trim();
  return imageUrlPattern.test(trimmed);
};

export const sanitizeImageUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.toString();
  } catch (error) {
    console.error(error);
    return url;
  }
};

export const getImageScaleStyle = (scale: number) => {
  const clampScale = Math.max(1, Math.min(scale, 1000));
  return {
    width: `${clampScale}%`,
  };
};
