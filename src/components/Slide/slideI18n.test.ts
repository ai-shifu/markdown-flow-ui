import { describe, expect, it } from "vitest";

import { getSlideLocaleTexts } from "./slideI18n";

describe("getSlideLocaleTexts", () => {
  it("uses selected ai-shifu slide text defaults while preserving interaction and waiting-for-audio copy", () => {
    expect(getSlideLocaleTexts("en-US")).toMatchObject({
      bufferingText: {
        waitingForAudio: "Waiting for current slide audio...",
        loadingAudio: "Loading audio...",
        waitingForMoreAudio: "Waiting for more audio...",
      },
      fullscreenBackAriaLabel: "Back to non-full screen",
      interactionTexts: {
        title: "Submit the content below to continue.",
      },
      playerTexts: {
        fullscreenHintText: "Please rotate your screen for the best experience",
      },
    });

    expect(getSlideLocaleTexts("fr-FR")).toMatchObject({
      bufferingText: {
        waitingForAudio: "En attente de l'audio de la diapositive actuelle...",
        loadingAudio: "Chargement audio…",
        waitingForMoreAudio: "En attente de plus d’audio…",
      },
      fullscreenBackAriaLabel: "Retour au mode non plein écran",
      interactionTexts: {
        title: "Soumettez le contenu ci-dessous pour continuer.",
      },
      playerTexts: {
        fullscreenHintText:
          "Veuillez tourner votre écran pour une meilleure expérience",
      },
    });

    expect(getSlideLocaleTexts("zh-CN")).toMatchObject({
      bufferingText: {
        waitingForAudio: "正在等待当前页音频...",
        loadingAudio: "正在加载音频",
        waitingForMoreAudio: "正在等待音频",
      },
      fullscreenBackAriaLabel: "返回非全屏",
      interactionTexts: {
        title: "提交下面的内容以继续",
      },
      playerTexts: {
        fullscreenHintText: "请旋转屏幕以获得最佳体验",
      },
    });
  });
});
