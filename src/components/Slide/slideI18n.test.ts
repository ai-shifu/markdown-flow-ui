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
        loadingAudio: "Chargement audio...",
        waitingForMoreAudio: "En attente de plus d'audio...",
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

    expect(getSlideLocaleTexts("ar-SA")).toMatchObject({
      bufferingText: {
        waitingForAudio: "في انتظار صوت الشريحة الحالية...",
        loadingAudio: "جارٍ تحميل الصوت...",
        waitingForMoreAudio: "في انتظار المزيد من الصوت...",
      },
      fullscreenBackAriaLabel: "العودة إلى العرض العادي",
      interactionTexts: {
        title: "أرسل المحتوى أدناه للمتابعة.",
      },
      playerTexts: {
        fullscreenHintText: "يرجى تدوير الشاشة للحصول على أفضل تجربة",
      },
    });

    expect(getSlideLocaleTexts("th-TH")).toMatchObject({
      bufferingText: {
        waitingForAudio: "กำลังรอเสียงของสไลด์ปัจจุบัน...",
        loadingAudio: "กำลังโหลดเสียง...",
        waitingForMoreAudio: "กำลังรอเสียงเพิ่มเติม...",
      },
      fullscreenBackAriaLabel: "กลับสู่โหมดปกติ",
      interactionTexts: {
        title: "ส่งเนื้อหาด้านล่างเพื่อดำเนินการต่อ",
      },
      playerTexts: {
        fullscreenHintText: "โปรดหมุนหน้าจอเพื่อประสบการณ์การใช้งานที่ดีที่สุด",
      },
    });
  });

  it("normalizes aliases and falls back to en-US for empty or unsupported locales", () => {
    const englishTexts = getSlideLocaleTexts("en-US");
    expect(getSlideLocaleTexts(null)).toEqual(englishTexts);
    expect(getSlideLocaleTexts(undefined)).toEqual(englishTexts);
    expect(getSlideLocaleTexts("es-ES")).toEqual(englishTexts);

    expect(getSlideLocaleTexts("fr")).toEqual(getSlideLocaleTexts("fr-FR"));
    expect(getSlideLocaleTexts("zh_CN")).toEqual(getSlideLocaleTexts("zh-CN"));
    expect(getSlideLocaleTexts("ar")).toEqual(getSlideLocaleTexts("ar-SA"));
    expect(getSlideLocaleTexts("ar_SA")).toEqual(getSlideLocaleTexts("ar-SA"));
    expect(getSlideLocaleTexts("th")).toEqual(getSlideLocaleTexts("th-TH"));
    expect(getSlideLocaleTexts("th_TH")).toEqual(getSlideLocaleTexts("th-TH"));
  });
});
