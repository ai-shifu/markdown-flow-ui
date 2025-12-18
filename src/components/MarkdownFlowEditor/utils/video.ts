const biliVideoUrlRegexp =
  /(https?:\/\/(?:www\.|m\.)?bilibili\.com\/video\/\S+\/?)/i;
const youtubeVideoUrlRegexp =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&].*)?$/i;

const BILI_PLAYER_BASE = "https://player.bilibili.com/player.html";

const extractBiliVideoId = (url: string) => {
  const bvidMatch = url.match(/\/video\/(BV[0-9A-Za-z]+)/i);
  if (bvidMatch && bvidMatch[1]) {
    return bvidMatch[1];
  }
  try {
    const searchParams = new URL(url).searchParams;
    const paramId = searchParams.get("bvid");
    return paramId;
  } catch (error) {
    console.log("Failed to parse bilibili url for bvid", error);
    return null;
  }
};

const extractYoutubeId = (url: string) => {
  const match = url.match(youtubeVideoUrlRegexp);
  return match ? match[1] : null;
};

const buildBilibiliEmbedUrl = (url: string) => {
  const biliVideoId = extractBiliVideoId(url);
  if (biliVideoId) {
    return `${BILI_PLAYER_BASE}?bvid=${biliVideoId}`;
  }
  return url;
};

const buildYoutubeEmbedUrl = (url: string) => {
  const videoId = extractYoutubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const getVideoEmbedUrl = (url: string) => {
  if (biliVideoUrlRegexp.test(url)) {
    return buildBilibiliEmbedUrl(url);
  }
  if (youtubeVideoUrlRegexp.test(url)) {
    return buildYoutubeEmbedUrl(url);
  }
  return url;
};

export {
  biliVideoUrlRegexp,
  youtubeVideoUrlRegexp,
  extractBiliVideoId,
  extractYoutubeId,
  buildBilibiliEmbedUrl,
  buildYoutubeEmbedUrl,
  getVideoEmbedUrl,
};
