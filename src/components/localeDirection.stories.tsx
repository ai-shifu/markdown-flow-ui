import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { MarkdownFlowLocale } from "../lib/locale";
import ContentRender from "./ContentRender";
import MarkdownFlowInput from "./ContentRender/MarkdownFlowInput";
import MarkdownFlow from "./MarkdownFlow/MarkdownFlow";
import ScrollableMarkdownFlow from "./MarkdownFlow/ScrollableMarkdownFlow";
import MarkdownFlowEditor, {
  EditMode,
} from "./MarkdownFlowEditor/MarkdownFlowEditor";
import { getEditorLocaleMessages } from "./MarkdownFlowEditor/editorI18n";
import Slide from "./Slide/Slide";
import Player from "./Slide/Player";
import type { Element as SlideElement } from "./Slide/types";
import { getSlidePlayerTexts } from "./Slide/slideI18n";
import IframeSandbox from "./ContentRender/IframeSandbox";
import { getContentRenderLocaleTexts } from "./ContentRender/contentRenderI18n";

const DirectionFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>();
  return (
    <div dir="rtl" lang="fr">
      <button type="button" onClick={() => setLocale("ar-SA")}>
        Arabic
      </button>
      <button type="button" onClick={() => setLocale("th-TH")}>
        Thai
      </button>
      <button type="button" onClick={() => setLocale(undefined)}>
        Inherit
      </button>
      <div data-testid="renderer">
        <ContentRender content="Direction preview" locale={locale} />
      </div>
      <div data-testid="input">
        <MarkdownFlowInput locale={locale} />
      </div>
      <div data-testid="flow">
        <MarkdownFlow locale={locale} />
      </div>
      <div data-testid="editor">
        <MarkdownFlowEditor locale={locale} />
      </div>
      <div data-testid="slide">
        <Slide elementList={[]} locale={locale} />
      </div>
      <div data-testid="player">
        <Player locale={locale} defaultPlaying={false} />
      </div>
    </div>
  );
};

const meta = {
  title: "MarkdownFlow/Locale direction",
  component: DirectionFixture,
} satisfies Meta<typeof DirectionFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

const LanguageBoundaryFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>();
  const [lang, setLang] = useState<string>();
  const [hostLanguage, setHostLanguage] = useState("fr");
  const props = { locale, lang };
  const html = '<div><p>Default language</p><p lang="it">Ciao</p></div>';
  return (
    <div lang={hostLanguage}>
      {(["ar-SA", "th-TH", undefined] as const).map((value) => (
        <button
          type="button"
          key={value ?? "inherit"}
          onClick={() => {
            setLocale(value);
            setLang(undefined);
          }}
        >
          {value ?? "inherit"}
        </button>
      ))}
      <button type="button" onClick={() => setLang("de")}>
        Override language
      </button>
      <button type="button" onClick={() => setHostLanguage("zh-CN")}>
        Change host language
      </button>
      <div data-testid="language-editor">
        <MarkdownFlowEditor
          {...props}
          editMode={EditMode.QuickEdit}
          content="{{learner}}"
          variables={[{ name: "learner" }]}
        />
      </div>
      <div data-testid="language-player">
        <Player {...props} defaultPlaying={false} />
      </div>
      <div data-testid="language-sandbox">
        <IframeSandbox {...props} type="sandbox" content={html} />
      </div>
      <div data-testid="language-scroll">
        <ScrollableMarkdownFlow {...props} height={120} />
      </div>
      <div data-testid="language-slide">
        <Slide
          {...props}
          playerEnabled={false}
          elementList={[
            {
              type: "html",
              content: html,
              sequence_number: 1,
              is_new: true,
              is_renderable: true,
              is_marker: true,
            },
          ]}
        />
      </div>
      <div data-testid="language-renderer">
        <ContentRender
          {...props}
          content={
            'نص <span lang="it">Ciao</span>\n\n<pre lang="es">Hola</pre>\n\n?[%{{reply}}...Answer]'
          }
        />
      </div>
      <div data-testid="language-html-renderer">
        <ContentRender {...props} content={html} />
      </div>
    </div>
  );
};

export const LanguageAcrossBoundaries: Story = {
  render: () => <LanguageBoundaryFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const checkLanguage = async (
      language: string,
      rootLanguage?: string,
      locale?: MarkdownFlowLocale
    ) => {
      await waitFor(() => {
        for (const name of [
          "editor",
          "player",
          "sandbox",
          "scroll",
          "slide",
          "renderer",
          "html-renderer",
        ]) {
          const root = canvas.getByTestId(
            `language-${name}`
          ).firstElementChild!;
          expect(root.getAttribute("lang")).toBe(rootLanguage ?? null);
          expect(root.closest("[lang]")?.getAttribute("lang")).toBe(language);
        }
        const frames = canvasElement.querySelectorAll("iframe");
        expect(frames).toHaveLength(3);
        for (const frame of frames) {
          const wrapper =
            frame.contentDocument!.querySelector(".sandbox-wrapper")!;
          expect(wrapper).toHaveAttribute("lang", language);
          expect(wrapper.querySelector("p[lang]")).toHaveAttribute(
            "lang",
            "it"
          );
        }
        const renderer = canvas.getByTestId("language-renderer");
        expect(renderer.querySelector("span[lang]")).toHaveAttribute(
          "lang",
          "it"
        );
        expect(renderer.querySelector("pre")).toHaveAttribute("lang", "es");
        expect(
          renderer.querySelector("textarea")!.closest("[lang]")
        ).toHaveAttribute("lang", language);
      });
      const editor = within(canvas.getByTestId("language-editor"));
      const texts = getEditorLocaleMessages(locale);
      await userEvent.click(
        editor.getByRole("button", { name: texts.toolbarInsertImage })
      );
      const dialog = await page.findByRole("dialog", {
        name: texts.dialogTitleImage,
      });
      expect(dialog).toHaveAttribute("lang", language);
      await userEvent.click(
        within(dialog).getByRole("button", { name: texts.dialogCloseLabel })
      );
      await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
      await userEvent.click(
        canvas
          .getByTestId("language-editor")
          .querySelector<HTMLElement>(".tag-variable .tag-placeholder-content")!
      );
      const popover = await page.findByRole("dialog");
      expect(popover).toHaveAttribute("lang", language);
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
      canvas
        .getByTestId("language-player")
        .querySelector<HTMLButtonElement>(".slide-player__action--mobile-more")!
        .click();
      const settings = await page.findByRole("dialog");
      expect(settings).toHaveAttribute("lang", language);
      await userEvent.click(
        within(settings).getByRole("button", {
          name: getSlidePlayerTexts(locale).closeSettingsLabel,
        })
      );
      await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    };
    await checkLanguage("fr");
    for (const locale of ["ar-SA", "th-TH"] as const) {
      await userEvent.click(canvas.getByRole("button", { name: locale }));
      await checkLanguage(locale, locale, locale);
    }
    await userEvent.click(
      canvas.getByRole("button", { name: "Override language" })
    );
    await checkLanguage("de", "de", "th-TH");
    await userEvent.click(canvas.getByRole("button", { name: "inherit" }));
    await checkLanguage("fr");
    await userEvent.click(
      canvas.getByRole("button", { name: "Change host language" })
    );
    await checkLanguage("zh-CN");
  },
};

const expectPlayerNavigationDirection = (root: Element) => {
  const rtl = getComputedStyle(root).direction === "rtl";
  for (const action of ["prev", "next", "prev-subtitle", "next-subtitle"]) {
    const icon = root.querySelector(`.slide-player__action--${action} svg`)!;
    expect(getComputedStyle(icon).transform).toBe(
      rtl && (action === "prev" || action === "next")
        ? "matrix(-1, 0, 0, 1, 0, 0)"
        : "none"
    );
  }
  const previous = root.querySelector(".slide-player__action--prev")!;
  const next = root.querySelector(".slide-player__action--next")!;
  expect(
    previous.getBoundingClientRect().left < next.getBoundingClientRect().left
  ).toBe(!rtl);
};

export const InheritedAndExplicitDirection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkDirection = async (dir: "rtl" | "ltr", explicit: boolean) => {
      await waitFor(() => {
        for (const name of [
          "renderer",
          "input",
          "flow",
          "editor",
          "slide",
          "player",
        ]) {
          const root = canvas.getByTestId(name).firstElementChild!;
          expect(root.getAttribute("dir")).toBe(explicit ? dir : null);
          expect(root.getAttribute("lang")).toBe(
            explicit ? (dir === "rtl" ? "ar-SA" : "th-TH") : null
          );
          expect(root.closest("[lang]")?.getAttribute("lang")).toBe(
            explicit ? (dir === "rtl" ? "ar-SA" : "th-TH") : "fr"
          );
          expect(getComputedStyle(root).direction).toBe(dir);
        }
        expectPlayerNavigationDirection(
          canvas.getByTestId("player").firstElementChild!
        );
      });
    };
    await checkDirection("rtl", false);
    await userEvent.click(canvas.getByRole("button", { name: "Arabic" }));
    await checkDirection("rtl", true);
    await userEvent.click(canvas.getByRole("button", { name: "Thai" }));
    await checkDirection("ltr", true);
    await userEvent.click(canvas.getByRole("button", { name: "Inherit" }));
    await checkDirection("rtl", false);
  },
};

const PlayerDirectionFixture = () => {
  const [dir, setDir] = useState("ltr");
  const [lastAction, setLastAction] = useState("");
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  return (
    <div>
      {["ltr", "rtl", "auto"].map((value) => (
        <button type="button" key={value} onClick={() => setDir(value)}>
          {value}
        </button>
      ))}
      <output data-testid="navigation-result">{lastAction}</output>
      <Player
        locale="ar-SA"
        dir={dir}
        defaultPlaying={false}
        onPrev={() => setLastAction("previous")}
        onNext={() => setLastAction("next")}
        isSubtitleEnabled={subtitleEnabled}
        onSubtitleToggle={() => setSubtitleEnabled((enabled) => !enabled)}
      />
    </div>
  );
};

export const PlayerDirectionOverride: Story = {
  render: () => <PlayerDirectionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const labels = getSlidePlayerTexts("ar-SA");
    for (const dir of ["ltr", "rtl", "auto"]) {
      await userEvent.click(canvas.getByRole("button", { name: dir }));
      expect(canvasElement.querySelector(".slide-player")).toHaveAttribute(
        "dir",
        dir
      );
      expectPlayerNavigationDirection(
        canvasElement.querySelector(".slide-player")!
      );
      for (const [name, action] of [
        [labels.previousLabel, "previous"],
        [labels.nextLabel, "next"],
      ]) {
        await userEvent.click(canvas.getByRole("button", { name }));
        expect(canvas.getByTestId("navigation-result")).toHaveTextContent(
          action
        );
      }
      // Exercise the portal even when the story is viewed at desktop width.
      canvasElement
        .querySelector<HTMLButtonElement>(".slide-player__action--mobile-more")!
        .click();
      await waitFor(() =>
        expect(page.getByRole("dialog")).toHaveAttribute("dir", dir)
      );
      const subtitleToggle = within(page.getByRole("dialog")).getByRole(
        "button",
        {
          name: labels.subtitleToggleAriaLabel,
        }
      );
      for (const enabled of [true, false, true]) {
        if (subtitleToggle.getAttribute("aria-pressed") !== String(enabled)) {
          await userEvent.click(subtitleToggle);
        }
        await waitFor(() => {
          expect(subtitleToggle).toHaveAttribute(
            "aria-pressed",
            String(enabled)
          );
          const track = subtitleToggle.firstElementChild!;
          const thumb = track.firstElementChild!;
          const trackRect = track.getBoundingClientRect();
          const thumbRect = thumb.getBoundingClientRect();
          const centerOffset =
            thumbRect.left +
            thumbRect.width / 2 -
            trackRect.left -
            trackRect.width / 2;
          const isRtl = getComputedStyle(subtitleToggle).direction === "rtl";
          expect(
            enabled !== isRtl ? centerOffset : -centerOffset
          ).toBeGreaterThan(3);
        });
      }
      await userEvent.click(
        page.getByRole("button", { name: labels.closeSettingsLabel })
      );
      await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    }
  },
};

const MobileLandscapePlayerFixture = () => {
  const [action, setAction] = useState("");
  return (
    <div>
      <output data-testid="landscape-action">{action}</output>
      {(["landscape", "landscape-native"] as const).flatMap((layout) =>
        (["ltr", "rtl"] as const).map((dir) => (
          <div
            key={`${layout}-${dir}`}
            data-testid={`${layout}-${dir}`}
            className={`slide--mobile-device slide--mobile-${layout}`}
            style={{ position: "relative", height: 120 }}
          >
            <Player
              dir={dir}
              defaultPlaying={false}
              hasInteraction
              onInteractionToggle={() => setAction(`${layout}-${dir}-notes`)}
              customActions={
                <button
                  type="button"
                  className="slide-player__action"
                  onClick={() => setAction(`${layout}-${dir}-custom`)}
                >
                  Extra
                </button>
              }
            />
          </div>
        ))
      )}
    </div>
  );
};

export const MobileLandscapePlayerDirection: Story = {
  render: () => <MobileLandscapePlayerFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    for (const layout of ["landscape", "landscape-native"]) {
      for (const dir of ["ltr", "rtl"]) {
        const fixture = canvas.getByTestId(`${layout}-${dir}`);
        const player = fixture.querySelector(".slide-player")!;
        const more = fixture.querySelector<HTMLButtonElement>(
          ".slide-player__action--mobile-more"
        )!;
        const notes = fixture.querySelector<HTMLButtonElement>(
          ".slide-player__action--notes"
        )!;
        const bounds = player.getBoundingClientRect();
        const moreBounds = more.getBoundingClientRect();
        const groupBounds = notes.parentElement!.getBoundingClientRect();
        expect(
          dir === "rtl"
            ? bounds.right - moreBounds.right
            : moreBounds.left - bounds.left
        ).toBeCloseTo(20, 0);
        expect(
          dir === "rtl"
            ? groupBounds.left - bounds.left
            : bounds.right - groupBounds.right
        ).toBeCloseTo(20, 0);
        await userEvent.click(notes);
        expect(canvas.getByTestId("landscape-action")).toHaveTextContent(
          `${layout}-${dir}-notes`
        );
        await userEvent.click(
          within(fixture).getByRole("button", { name: "Extra" })
        );
        expect(canvas.getByTestId("landscape-action")).toHaveTextContent(
          `${layout}-${dir}-custom`
        );
        await userEvent.click(more);
        await waitFor(() =>
          expect(page.getByRole("dialog")).toHaveAttribute("dir", dir)
        );
        await userEvent.click(
          within(page.getByRole("dialog")).getByRole("button", {
            name: getSlidePlayerTexts().closeSettingsLabel,
          })
        );
        await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
      }
    }
  },
};

const InheritedPlayerSettingsFixture = () => {
  const [direction, setDirection] = useState("rtl");
  return (
    <div dir={direction}>
      <button
        type="button"
        onClick={() => setDirection(direction === "rtl" ? "ltr" : "rtl")}
      >
        Change host direction
      </button>
      <Player defaultPlaying={false} enableKeyboardShortcuts={false} />
    </div>
  );
};

export const InheritedPlayerSettingsDirection: Story = {
  render: () => <InheritedPlayerSettingsFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const player = canvasElement.querySelector(".slide-player")!;
    expect(player).not.toHaveAttribute("dir");
    player
      .querySelector<HTMLButtonElement>(".slide-player__action--mobile-more")!
      .click();
    for (const direction of ["rtl", "ltr", "rtl"]) {
      await waitFor(() => {
        const dialog = page.getByRole("dialog");
        expect(player.contains(dialog)).toBe(false);
        expect(getComputedStyle(player).direction).toBe(direction);
        expect(getComputedStyle(dialog).direction).toBe(direction);
      });
      // Simulate a host update while the modal keeps the page inert.
      canvas.getByText("Change host direction").click();
    }
    await userEvent.click(
      page.getByRole("button", {
        name: getSlidePlayerTexts().closeSettingsLabel,
      })
    );
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
  },
};

const KeyboardDirectionFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale | undefined>("ar-SA");
  const [dir, setDir] = useState<string>();
  const [hostDir, setHostDir] = useState("rtl");
  const [text, setText] = useState("معاينة");
  const [lastAction, setLastAction] = useState("");
  const [enabled, setEnabled] = useState(true);
  return (
    <div>
      {(["ar-SA", "th-TH", undefined] as const).map((value) => (
        <button
          key={value ?? "inherit"}
          type="button"
          onClick={() => {
            setLocale(value);
            setDir(undefined);
          }}
        >
          {value ?? "inherit"}
        </button>
      ))}
      {["ltr", "rtl", "auto"].map((value) => (
        <button type="button" key={value} onClick={() => setDir(value)}>
          {value}
        </button>
      ))}
      <button type="button" onClick={() => setHostDir("ltr")}>
        Change host
      </button>
      <button type="button" onClick={() => setText("Preview")}>
        Change text
      </button>
      <button type="button" onClick={() => setEnabled(false)}>
        Disable shortcuts
      </button>
      <output data-testid="keyboard-result">{lastAction}</output>
      <div dir={hostDir}>
        <Player
          locale={locale}
          dir={dir}
          defaultPlaying={false}
          enableKeyboardShortcuts={enabled}
          onPrev={() => setLastAction("previous")}
          onNext={() => setLastAction("next")}
          customActions={<span>{text}</span>}
        />
      </div>
    </div>
  );
};

export const DirectionAwarePageShortcuts: Story = {
  render: () => <KeyboardDirectionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const player = canvasElement.querySelector<HTMLElement>(".slide-player")!;
    const previous = player.querySelector<HTMLButtonElement>(
      ".slide-player__action--prev"
    )!;
    const next = player.querySelector<HTMLButtonElement>(
      ".slide-player__action--next"
    )!;
    const check = async (direction: "ltr" | "rtl") => {
      const previousKey = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
      const nextKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
      await waitFor(() => {
        expect(getComputedStyle(player).direction).toBe(direction);
        expect(previous).toHaveAttribute("aria-keyshortcuts", previousKey);
        expect(next).toHaveAttribute("aria-keyshortcuts", nextKey);
        expect(
          previous.title.endsWith(direction === "rtl" ? "(→)" : "(←)")
        ).toBe(true);
        expect(next.title.endsWith(direction === "rtl" ? "(←)" : "(→)")).toBe(
          true
        );
      });
      expectPlayerNavigationDirection(player);
      await userEvent.click(previous);
      await userEvent.keyboard(`{${nextKey}}`);
      expect(canvas.getByTestId("keyboard-result")).toHaveTextContent("next");
      await userEvent.keyboard(`{${previousKey}}`);
      expect(canvas.getByTestId("keyboard-result")).toHaveTextContent(
        "previous"
      );
      expect(
        player.querySelector(".slide-player__action--prev-subtitle")
      ).toHaveAttribute("aria-keyshortcuts", "Shift+ArrowLeft");
      expect(
        player.querySelector(".slide-player__action--next-subtitle")
      ).toHaveAttribute("aria-keyshortcuts", "Shift+ArrowRight");
    };
    await check("rtl");
    for (const [button, direction] of [
      ["ltr", "ltr"],
      ["th-TH", "ltr"],
      ["rtl", "rtl"],
      ["inherit", "rtl"],
      ["Change host", "ltr"],
      ["auto", "rtl"],
      ["Change text", "ltr"],
    ] as const) {
      await userEvent.click(canvas.getByRole("button", { name: button }));
      await check(direction);
    }
    await userEvent.click(
      canvas.getByRole("button", { name: "Disable shortcuts" })
    );
    expect(previous).not.toHaveAttribute("aria-keyshortcuts");
    expect(next).not.toHaveAttribute("aria-keyshortcuts");
    await userEvent.click(previous);
    await userEvent.keyboard("{ArrowRight}");
    expect(canvas.getByTestId("keyboard-result")).toHaveTextContent("previous");
  },
};

const slideDirectionElements: { id: string; element: SlideElement }[] = [
  {
    id: "markdown-slide",
    element: { type: "text", content: "Default slide content" },
  },
  {
    id: "html-slide",
    element: {
      type: "html",
      content: '<p>Default HTML content</p><p dir="rtl">Authored direction</p>',
    },
  },
  {
    id: "interaction-slide",
    element: {
      type: "interaction",
      content: "?[%{{answer}}...Answer]\n\n?[%{{choice}}First|...Other]",
      readonly: false,
    },
  },
];

const SlideContentDirectionFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>("ar-SA");
  const [dir, setDir] = useState("ltr");
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setLocale("th-TH");
          setDir("rtl");
        }}
      >
        Thai RTL
      </button>
      {slideDirectionElements.map(({ id, element }) => (
        <div key={id} data-testid={id}>
          <Slide
            locale={locale}
            dir={dir}
            elementList={[
              {
                ...element,
                sequence_number: 1,
                is_new: true,
                is_renderable: true,
                is_marker: true,
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
};

export const SlideContentDirectionOverride: Story = {
  render: () => <SlideContentDirectionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const dir of ["ltr", "rtl"]) {
      if (dir === "rtl")
        await userEvent.click(canvas.getByRole("button", { name: "Thai RTL" }));
      await waitFor(() => {
        const markdown = canvas
          .getByTestId("markdown-slide")
          .querySelector(".content-render")!;
        expect(markdown).not.toBeNull();
        expect(getComputedStyle(markdown).direction).toBe(dir);
        const interaction = canvas
          .getByTestId("interaction-slide")
          .querySelector(".slide-player__interaction-body .content-render")!;
        expect(interaction).not.toBeNull();
        expect(getComputedStyle(interaction).direction).toBe(dir);
        const inputs = interaction.querySelectorAll("textarea");
        expect(inputs).toHaveLength(2);
        for (const input of inputs)
          expect(getComputedStyle(input).direction).toBe(dir);
        const iframe = canvas
          .getByTestId("html-slide")
          .querySelector("iframe")!;
        const paragraphs = iframe.contentDocument!.querySelectorAll("p");
        expect(paragraphs).toHaveLength(2);
        expect(
          iframe.contentWindow!.getComputedStyle(paragraphs[0]).direction
        ).toBe(dir);
        expect(
          iframe.contentWindow!.getComputedStyle(paragraphs[1]).direction
        ).toBe("rtl");
      });
    }
  },
};

const AutoSlidePlayerDirectionFixture = () => {
  const [content, setContent] = useState("مرحبا بالعالم");
  return (
    <div dir="rtl">
      <button type="button" onClick={() => setContent("Hello world")}>
        English content
      </button>
      {(["text", "slot"] as const).map((type) => (
        <div key={type} data-testid={`auto-slide-${type}`}>
          <Slide
            dir="auto"
            elementList={[
              {
                type,
                content,
                sequence_number: 1,
                is_new: true,
                is_renderable: true,
                is_marker: true,
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
};

export const AutoSlidePlayerDirection: Story = {
  render: () => <AutoSlidePlayerDirectionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const text of ["مرحبا بالعالم", "Hello world"]) {
      if (text === "Hello world") {
        await userEvent.click(
          canvas.getByRole("button", { name: "English content" })
        );
      }
      await waitFor(() => {
        for (const type of ["text", "slot"]) {
          const section = canvas
            .getByTestId(`auto-slide-${type}`)
            .querySelector("section")!;
          const player = section.querySelector(".slide-player")!;
          expect(section).toHaveTextContent(text);
          expect(section).toHaveAttribute("dir", "auto");
          if (type === "slot") {
            expect(getComputedStyle(section).direction).toBe(
              text === "Hello world" ? "ltr" : "rtl"
            );
          }
          expect(getComputedStyle(player).direction).toBe(
            getComputedStyle(section).direction
          );
          expectPlayerNavigationDirection(player);
        }
      });
    }
  },
};

const sourceCode =
  'const greeting = "مرحبا";\nconst url = "https://example.com/a?b=1";';

const MermaidLocaleFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>("ar-SA");
  return (
    <div>
      <button type="button" onClick={() => setLocale("th-TH")}>
        Thai
      </button>
      <ContentRender
        locale={locale}
        content={"```mermaid\n\n```\n\n~~~mermaid\n\n~~~"}
      />
    </div>
  );
};

export const MermaidLocaleMessages: Story = {
  render: () => <MermaidLocaleFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(
        canvas.getAllByText(
          getContentRenderLocaleTexts("ar-SA").mermaidEmptyChartText
        )
      ).toHaveLength(2)
    );
    await userEvent.click(canvas.getByRole("button", { name: "Thai" }));
    await waitFor(() =>
      expect(
        canvas.getAllByText(
          getContentRenderLocaleTexts("th-TH").mermaidEmptyChartText
        )
      ).toHaveLength(2)
    );
  },
};

export const MermaidErrorSourceDirection: Story = {
  render: () => (
    <ContentRender
      locale="ar-SA"
      content={'```mermaid\ninvalid ??? ["مرحبا"] -->;\n```'}
    />
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const pre = canvasElement.querySelector("pre")!;
      expect(pre).not.toBeNull();
      expect(getComputedStyle(pre).direction).toBe("ltr");
      expect(getComputedStyle(pre).unicodeBidi).toBe("isolate");
      expect(getComputedStyle(pre).textAlign).toBe("start");
      expect(pre.querySelector("code")!.textContent).toBe(
        'invalid ??? ["مرحبا"] -->;'
      );
      const message = pre.parentElement!.previousElementSibling!;
      expect(getComputedStyle(message).direction).toBe("rtl");
    });
  },
};

export const ArabicCodeBlocks: Story = {
  render: () => (
    <ContentRender
      locale="ar-SA"
      content={`نص عربي\n\n\`\`\`javascript\n${sourceCode}\n\`\`\`\n\n\`\`\`\n${sourceCode}\n\`\`\``}
    />
  ),
  play: async ({ canvasElement }) => {
    const blocks = canvasElement.querySelectorAll(".code-block-container");
    expect(blocks).toHaveLength(2);
    expect(getComputedStyle(canvasElement.querySelector("p")!).direction).toBe(
      "rtl"
    );
    for (const block of blocks) {
      const pre = block.querySelector("pre")!;
      expect(getComputedStyle(pre).direction).toBe("ltr");
      expect(getComputedStyle(pre).textAlign).toBe("start");
      expect(getComputedStyle(pre).unicodeBidi).toBe("isolate");
      expect(getComputedStyle(pre.querySelector("code")!).direction).toBe(
        "ltr"
      );
      expect(pre.textContent?.trim()).toBe(sourceCode);
      const copyButton = block.querySelector("button")!;
      expect(getComputedStyle(copyButton).direction).toBe("rtl");
      expect(copyButton).toHaveTextContent(
        getContentRenderLocaleTexts("ar-SA").copyButtonText
      );
    }
  },
};

const LocaleContentFixture = ({ content }: { content: string }) => (
  <div dir="rtl">
    {(["ar-SA", "th-TH", undefined] as const).map((locale) => (
      <div key={locale ?? "inherit"} data-testid={locale ?? "inherit"}>
        <ContentRender locale={locale} content={content} />
      </div>
    ))}
  </div>
);

export const IsolatedInlineCode: Story = {
  render: () => (
    <LocaleContentFixture
      content={[
        'استخدم `call("مرحبا");` ثم `https://example.com/a?b=1`.',
        '<code dir="rtl">مرحبا</code> <code dir="ltr">hello</code>',
        '<code dir="auto">مرحبا</code> <code dir="auto">hello</code>',
        '<code>call("مرحبا");</code>',
      ].join("\n\n")}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of ["ar-SA", "th-TH", "inherit"]) {
      const fixture = canvas.getByTestId(locale);
      expect(getComputedStyle(fixture.querySelector("p")!).direction).toBe(
        locale === "th-TH" ? "ltr" : "rtl"
      );
      const snippets = fixture.querySelectorAll("code");
      expect(snippets).toHaveLength(7);
      expect(snippets[0]).toHaveTextContent('call("مرحبا");');
      expect(snippets[1]).toHaveTextContent("https://example.com/a?b=1");
      for (const [index, [attribute, computed]] of [
        ["ltr", "ltr"],
        ["ltr", "ltr"],
        ["rtl", "rtl"],
        ["ltr", "ltr"],
        ["auto", "rtl"],
        ["auto", "ltr"],
        ["ltr", "ltr"],
      ].entries()) {
        const snippet = snippets[index];
        expect(snippet).toHaveAttribute("dir", attribute);
        expect(getComputedStyle(snippet).direction).toBe(computed);
        expect(getComputedStyle(snippet).unicodeBidi).toBe("isolate");
      }
    }
  },
};

export const AuthoredPreformattedDirection: Story = {
  render: () => (
    <LocaleContentFixture
      content={[
        '<pre dir="rtl">مرحبا 123!</pre>',
        '<pre dir="ltr">hello 123!</pre>',
        '<pre dir="auto">مرحبا 123!</pre>',
        '<pre dir="auto">hello 123!</pre>',
        "<pre>hello 123!</pre>",
        "```javascript\nconst value = 123;\n```",
        '<pre dir="rtl"><code>مرحبا 123!</code></pre>',
        '<pre dir="ltr"><code>hello 123!</code></pre>',
        '<pre dir="auto"><code>مرحبا 123!</code></pre>',
        '<pre dir="auto"><code>hello 123!</code></pre>',
        "<pre><code>hello 123!</code></pre>",
        '<pre dir="rtl"><code dir="ltr">hello 123!</code></pre>',
        '<pre dir="ltr"><code dir="rtl">مرحبا 123!</code></pre>',
        '<pre dir="rtl"><code dir="auto">hello 123!</code></pre>',
      ].join("\n\n")}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of ["ar-SA", "th-TH", "inherit"]) {
      const fixture = canvas.getByTestId(locale);
      const blocks = fixture.querySelectorAll("pre");
      expect(blocks).toHaveLength(14);
      for (const [index, [attribute, direction]] of [
        ["rtl", "rtl"],
        ["ltr", "ltr"],
        ["auto", "rtl"],
        ["auto", "ltr"],
        ["ltr", "ltr"],
        ["ltr", "ltr"],
        ["rtl", "rtl"],
        ["ltr", "ltr"],
        ["auto", "rtl"],
        ["auto", "ltr"],
        ["ltr", "ltr"],
        ["rtl", "rtl"],
        ["ltr", "ltr"],
        ["rtl", "rtl"],
      ].entries()) {
        const block = blocks[index];
        expect(block).toHaveAttribute("dir", attribute);
        expect(getComputedStyle(block).direction).toBe(direction);
        expect(getComputedStyle(block).unicodeBidi).toBe("isolate");
        expect(getComputedStyle(block).textAlign).toBe("start");
      }
      expect(blocks[0]).toHaveTextContent("مرحبا 123!");
      expect(blocks[5]).toHaveTextContent("const value = 123;");
      for (const [index, [attribute, direction]] of [
        [null, "rtl"],
        [null, "ltr"],
        [null, "rtl"],
        [null, "ltr"],
        [null, "ltr"],
        ["ltr", "ltr"],
        ["rtl", "rtl"],
        ["auto", "ltr"],
      ].entries()) {
        const code = blocks[index + 6].querySelector("code")!;
        expect(code.getAttribute("dir")).toBe(attribute);
        expect(getComputedStyle(code).direction).toBe(direction);
      }
    }
  },
};

export const IsolatedMathDirection: Story = {
  render: () => (
    <LocaleContentFixture content={"قبل $1+2=3$ بعد.\n\n$$\n1+2=3\n$$"} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of ["ar-SA", "th-TH", "inherit"]) {
      const fixture = canvas.getByTestId(locale);
      const paragraph = fixture.querySelector("p")!;
      expect(getComputedStyle(paragraph).direction).toBe(
        locale === "th-TH" ? "ltr" : "rtl"
      );
      expect(paragraph.textContent).toContain("قبل");
      expect(paragraph.textContent).toContain("بعد.");
      const formulas = fixture.querySelectorAll(".katex");
      expect(formulas).toHaveLength(2);
      const display = fixture.querySelector(".katex-display")!;
      expect(display).not.toBeNull();
      expect(getComputedStyle(display).direction).toBe("ltr");
      expect(getComputedStyle(display).unicodeBidi).toBe("isolate");
      for (const formula of formulas) {
        expect(getComputedStyle(formula).direction).toBe("ltr");
        expect(getComputedStyle(formula).unicodeBidi).toBe("isolate");
        expect(
          formula.querySelector('annotation[encoding="application/x-tex"]')
        ).toHaveTextContent("1+2=3");
        const terms = formula.querySelectorAll(
          ".katex-html .mord, .katex-html .mbin, .katex-html .mrel"
        );
        expect(Array.from(terms, (term) => term.textContent)).toEqual([
          "1",
          "+",
          "2",
          "=",
          "3",
        ]);
        for (let index = 1; index < terms.length; index++) {
          expect(
            terms[index].getBoundingClientRect().left
          ).toBeGreaterThanOrEqual(
            terms[index - 1].getBoundingClientRect().right - 0.5
          );
        }
      }
    }
  },
};

const TableDirectionFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>();
  return (
    <div dir="rtl">
      <button type="button" onClick={() => setLocale("ar-SA")}>
        Arabic
      </button>
      <button type="button" onClick={() => setLocale("th-TH")}>
        Thai
      </button>
      <ContentRender
        locale={locale}
        content={
          "| افتراضي | يسار | وسط | يمين |\n| --- | :--- | :---: | ---: |\n| نص | نص | نص | نص |"
        }
      />
    </div>
  );
};

export const DirectionAwareTables: Story = {
  render: () => <TableDirectionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of [undefined, "ar-SA", "th-TH"] as const) {
      if (locale) {
        await userEvent.click(
          canvas.getByRole("button", {
            name: locale === "ar-SA" ? "Arabic" : "Thai",
          })
        );
      }
      const rows = canvasElement.querySelectorAll("tr");
      expect(rows).toHaveLength(2);
      for (const row of rows) {
        const cells = row.querySelectorAll("th, td");
        expect(cells).toHaveLength(4);
        for (const [index, alignment] of [
          "start",
          "left",
          "center",
          "right",
        ].entries()) {
          const style = getComputedStyle(cells[index]);
          expect(style.direction).toBe(locale === "th-TH" ? "ltr" : "rtl");
          expect(style.textAlign).toBe(alignment);
        }
      }
    }
  },
};

export const DirectionAwareMarkdownStructure: Story = {
  render: () => (
    <div dir="rtl">
      {(["ar-SA", "th-TH", undefined] as const).map((locale) => (
        <div key={locale ?? "inherit"} data-testid={locale ?? "inherit"}>
          <ContentRender
            locale={locale}
            content={
              "1. First\n   - Nested\n\n- Second\n  1. Nested ordered\n\n> Quoted text\n>\n> - Quoted list"
            }
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of ["ar-SA", "th-TH", "inherit"]) {
      const fixture = canvas.getByTestId(locale);
      const [start, end, direction] =
        locale === "th-TH"
          ? (["Left", "Right", "ltr"] as const)
          : (["Right", "Left", "rtl"] as const);
      const lists = fixture.querySelectorAll("ul, ol");
      expect(lists).toHaveLength(5);
      for (const list of lists) {
        const style = getComputedStyle(list);
        expect(style.direction).toBe(direction);
        expect(Number.parseFloat(style[`padding${start}`])).toBeGreaterThan(0);
        expect(Number.parseFloat(style[`padding${end}`])).toBe(0);
      }
      const quote = getComputedStyle(fixture.querySelector("blockquote")!);
      expect(Number.parseFloat(quote[`border${start}Width`])).toBeGreaterThan(
        0
      );
      expect(Number.parseFloat(quote[`border${end}Width`])).toBe(0);
    }
  },
};

export const TaskListCheckboxSpacing: Story = {
  render: () => (
    <LocaleContentFixture
      content={"- [ ] Unchecked task\n- [x] Completed task"}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of ["ar-SA", "th-TH", "inherit"]) {
      const boxes = canvas
        .getByTestId(locale)
        .querySelectorAll<HTMLInputElement>(".content-render-checkbox");
      expect(boxes).toHaveLength(2);
      for (const [index, box] of Array.from(boxes).entries()) {
        expect(box.checked).toBe(index === 1);
        expect(box).toBeDisabled();
        const style = getComputedStyle(box);
        expect(style.marginInlineEnd).toBe("8px");
        expect(style.marginInlineStart).toBe("0px");
        const row = box.closest("li")!;
        const range = row.ownerDocument.createRange();
        range.setStartAfter(box);
        range.setEnd(row, row.childNodes.length);
        const label = range.getBoundingClientRect();
        const checkbox = box.getBoundingClientRect();
        expect(
          locale === "th-TH"
            ? label.left - checkbox.right
            : checkbox.left - label.right
        ).toBeGreaterThanOrEqual(8);
      }
    }
  },
};

export const DirectionAwareFootnotes: Story = {
  render: () => (
    <LocaleContentFixture
      content={[
        "نص مع حاشية[^note].",
        "",
        "[^note]: Footnote text",
        "",
        "    - Nested item",
        "      - Deeper item",
      ].join("\n")}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of ["ar-SA", "th-TH", "inherit"]) {
      const fixture = canvas.getByTestId(locale);
      const lists = fixture.querySelectorAll(".footnotes ol, .footnotes ul");
      const texts = getContentRenderLocaleTexts(
        locale === "inherit" ? undefined : locale
      );
      expect(fixture.querySelector(".footnotes h2")).toHaveTextContent(
        texts.footnoteLabel
      );
      expect(fixture.querySelector("[data-footnote-backref]")).toHaveAttribute(
        "aria-label",
        texts.footnoteBackLabel.replace("{reference}", "1")
      );
      expect(lists).toHaveLength(3);
      for (const list of lists) {
        const style = getComputedStyle(list);
        expect(style.direction).toBe(locale === "th-TH" ? "ltr" : "rtl");
        expect(style.paddingInlineStart).toBe("16px");
        expect(style.paddingInlineEnd).toBe("0px");
      }
    }
  },
};

const wrappedChoices = [
  {
    id: "arabic",
    locale: "ar-SA",
    label:
      "أرغب في تعلم كيفية تصميم تجربة تعليمية تفاعلية تناسب احتياجات المتعلم",
  },
  {
    id: "thai",
    locale: "th-TH",
    label:
      "ฉันต้องการเรียนรู้วิธีออกแบบประสบการณ์การเรียนรู้ที่เหมาะกับผู้เรียนแต่ละคน",
  },
  {
    id: "inherited",
    locale: undefined,
    label: "A longer choice that wraps across several lines in a narrow layout",
  },
] as const;
const onWrappedChoiceSend = fn();

export const DirectionAwareWrappedChoices: Story = {
  render: () => (
    <div dir="rtl" style={{ width: 180 }}>
      {wrappedChoices.map(({ id, locale, label }) => (
        <div key={id} data-testid={id}>
          <ContentRender
            locale={locale}
            content={`?[%{{choice}}${label}|Short]`}
            onSend={onWrappedChoiceSend}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    onWrappedChoiceSend.mockClear();
    const canvas = within(canvasElement);
    for (const { id, locale, label } of wrappedChoices) {
      const button = within(canvas.getByTestId(id)).getByRole("button", {
        name: label,
      });
      const style = getComputedStyle(button);
      expect(style.direction).toBe(locale === "th-TH" ? "ltr" : "rtl");
      expect(style.textAlign).toBe("start");
      const range = canvasElement.ownerDocument.createRange();
      range.selectNodeContents(button);
      const lines = Array.from(range.getClientRects());
      expect(
        new Set(lines.map((line) => Math.round(line.top))).size
      ).toBeGreaterThan(1);
      expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(180);
      await userEvent.click(button);
      expect(onWrappedChoiceSend).toHaveBeenLastCalledWith({
        variableName: "choice",
        buttonText: label,
      });
    }
  },
};

export const DirectionAwareCheckboxLabels: Story = {
  render: () => (
    <div dir="rtl">
      {(["ar-SA", "th-TH", undefined] as const).map((locale) => (
        <div key={locale ?? "inherit"} data-testid={locale ?? "inherit"}>
          <ContentRender
            locale={locale}
            content="?[%{{choice}}First||Second]"
          />
          <ContentRender
            locale={locale}
            content="?[%{{readonlyChoice}}Disabled||Unavailable]"
            readonly
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of ["ar-SA", "th-TH", "inherit"]) {
      const fixture = canvas.getByTestId(locale);
      const checkboxes = within(fixture).getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(4);
      for (const checkbox of checkboxes) {
        const label = checkbox.closest("label")!;
        const box = label.firstElementChild!.getBoundingClientRect();
        const text = label.lastElementChild!.getBoundingClientRect();
        expect(
          locale === "th-TH" ? text.left - box.right : box.left - text.right
        ).toBeCloseTo(8, 0);
      }
      await userEvent.click(checkboxes[0].closest("label")!);
      expect(checkboxes[0]).toBeChecked();
      await userEvent.click(checkboxes[0].closest("label")!);
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[2]).toBeDisabled();
      await userEvent.click(checkboxes[2].closest("label")!);
      expect(checkboxes[2]).not.toBeChecked();
    }
  },
};

export const StandaloneArabicInput: Story = {
  render: () => (
    <div dir="ltr" style={{ width: 360 }}>
      <MarkdownFlowInput locale="ar-SA" placeholder="اكتب إجابتك" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    const button = canvas.getByRole("button", {
      name: getContentRenderLocaleTexts("ar-SA").sendButtonLabel,
    });
    expect(getComputedStyle(input).direction).toBe("rtl");
    expect(input).toHaveAttribute("placeholder", "اكتب إجابتك");
    expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(
      input.getBoundingClientRect().left
    );
  },
};

const ToolbarDirectionFixture = () => {
  const [lastAction, setLastAction] = useState("");
  return (
    <div dir="rtl" style={{ width: 900, maxWidth: "100%" }}>
      <output data-testid="toolbar-action-result">{lastAction}</output>
      {(["ar-SA", "th-TH", undefined] as const).map((locale) => (
        <div key={locale ?? "inherit"} data-testid={locale ?? "inherit"}>
          <MarkdownFlowEditor
            locale={locale}
            toolbarActionsRight={[
              {
                key: "custom",
                label: "Custom action",
                onClick: () => setLastAction(locale ?? "inherit"),
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
};

export const DirectionAwareToolbarActions: Story = {
  render: () => <ToolbarDirectionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of ["ar-SA", "th-TH", "inherit"]) {
      const fixture = canvas.getByTestId(locale);
      const toolbar = fixture.querySelector(".markdown-flow-editor-toolbar")!;
      const actions = fixture.querySelector(
        ".markdown-flow-editor-toolbar-right-wrapper"
      )!;
      const primary = fixture.querySelector(
        ".markdown-flow-editor-toolbar-left"
      )!;
      const toolbarRect = toolbar.getBoundingClientRect();
      const actionRect = actions.getBoundingClientRect();
      const primaryRect = primary.getBoundingClientRect();
      const rtl = locale !== "th-TH";
      expect(
        rtl
          ? actionRect.left - toolbarRect.left
          : toolbarRect.right - actionRect.right
      ).toBeCloseTo(
        Number.parseFloat(getComputedStyle(toolbar).paddingInlineEnd),
        0
      );
      expect(
        rtl
          ? primaryRect.left - actionRect.right
          : actionRect.left - primaryRect.right
      ).toBeGreaterThan(20);
      await userEvent.click(
        within(fixture).getByRole("button", { name: "Custom action" })
      );
      expect(canvas.getByTestId("toolbar-action-result")).toHaveTextContent(
        locale
      );
    }
  },
};

const EditorDialogLocaleFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>("ar-SA");
  return (
    <div>
      <button type="button" onClick={() => setLocale("th-TH")}>
        Thai
      </button>
      <MarkdownFlowEditor locale={locale} />
    </div>
  );
};

const expectDialogClosePlacement = (dialog: HTMLElement, label: string) => {
  const close = within(dialog).getByRole("button", {
    name: label,
  });
  expect(getComputedStyle(close).insetInlineEnd).toBe("16px");
  const title = within(dialog).getByRole("heading");
  const range = dialog.ownerDocument.createRange();
  range.selectNodeContents(title);
  const titleRect = range.getBoundingClientRect();
  const closeRect = close.getBoundingClientRect();
  const rtl = getComputedStyle(dialog).direction === "rtl";
  expect(rtl ? closeRect.right : titleRect.right).toBeLessThan(
    rtl ? titleRect.left : closeRect.left
  );
};

export const EditorDialogCloseLabels: Story = {
  render: () => <EditorDialogLocaleFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    for (const locale of ["ar-SA", "th-TH"] as const) {
      if (locale === "th-TH") {
        await userEvent.click(canvas.getByRole("button", { name: "Thai" }));
      }
      const texts = getEditorLocaleMessages(locale);
      for (const [trigger, title] of [
        [texts.toolbarInsertImage, texts.dialogTitleImage],
        [texts.toolbarInsertVideo, texts.dialogTitleVideo],
      ]) {
        await userEvent.click(canvas.getByRole("button", { name: trigger }));
        const dialog = await page.findByRole("dialog", { name: title });
        expect(getComputedStyle(dialog).direction).toBe(
          locale === "ar-SA" ? "rtl" : "ltr"
        );
        expectDialogClosePlacement(dialog, texts.dialogCloseLabel);
        expect(
          within(dialog).queryByRole("button", { name: "Close" })
        ).toBeNull();
        await userEvent.click(
          within(dialog).getByRole("button", {
            name: texts.dialogCloseLabel,
          })
        );
        await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
      }
    }
  },
};

export const EditorUrlDirection: Story = {
  render: () => <EditorDialogLocaleFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const url = "https://example.com/path?a=1&b=2#part";
    for (const locale of ["ar-SA", "th-TH"] as const) {
      if (locale === "th-TH") {
        await userEvent.click(canvas.getByRole("button", { name: "Thai" }));
      }
      const texts = getEditorLocaleMessages(locale);
      for (const [trigger, title, placeholder] of [
        [
          texts.toolbarInsertImage,
          texts.dialogTitleImage,
          texts.imageUrlPlaceholder,
        ],
        [
          texts.toolbarInsertVideo,
          texts.dialogTitleVideo,
          texts.videoUrlPlaceholder,
        ],
      ]) {
        await userEvent.click(canvas.getByRole("button", { name: trigger }));
        const dialog = await page.findByRole("dialog", { name: title });
        const input = within(dialog).getByPlaceholderText(
          placeholder
        ) as HTMLInputElement;
        expect(getComputedStyle(input).direction).toBe("ltr");
        const direction = locale === "ar-SA" ? "rtl" : "ltr";
        expect(getComputedStyle(dialog).direction).toBe(direction);
        for (const label of dialog.querySelectorAll("label")) {
          expect(getComputedStyle(label).direction).toBe(direction);
        }
        const titleInput = within(dialog).queryByPlaceholderText(
          texts.videoTitlePlaceholder
        );
        if (titleInput)
          expect(getComputedStyle(titleInput).direction).toBe(direction);
        await userEvent.type(input, url);
        expect(input).toHaveValue(url);
        const queryValueStart = url.indexOf("1&");
        input.setSelectionRange(queryValueStart, queryValueStart + 1);
        await userEvent.keyboard("7");
        expect(input).toHaveValue(url.replace("a=1", "a=7"));
        expect(input.selectionStart).toBe(queryValueStart + 1);
        await userEvent.click(
          within(dialog).getByRole("button", { name: texts.dialogCloseLabel })
        );
        await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
      }
    }
  },
};

const expectSearchAffordance = (input: HTMLInputElement) => {
  const style = getComputedStyle(input);
  const inputRect = input.getBoundingClientRect();
  const iconRect = input
    .parentElement!.querySelector("svg")!
    .getBoundingClientRect();
  expect(
    style.direction === "rtl"
      ? inputRect.right - iconRect.right
      : iconRect.left - inputRect.left
  ).toBeCloseTo(12, 0);
  expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThanOrEqual(
    32
  );
  expect(Number.parseFloat(style.paddingInlineEnd)).toBeLessThan(32);
};

const expectVariablePopoverAnchor = async (
  host: HTMLElement,
  popover: HTMLElement,
  direction: string
) => {
  await waitFor(() => {
    const trigger = host.querySelector(
      ".tag-variable .tag-placeholder-content"
    )!;
    const edge = direction === "rtl" ? "right" : "left";
    expect(
      Math.abs(
        popover.getBoundingClientRect()[edge] -
          trigger.getBoundingClientRect()[edge]
      )
    ).toBeLessThanOrEqual(1);
  });
};

export const InheritedEditorPortalDirection: Story = {
  render: () => (
    <div
      dir="rtl"
      data-testid="editor-host"
      style={{ width: 320, marginInline: "auto" }}
    >
      <MarkdownFlowEditor
        content="Variable: {{learner}}"
        editMode={EditMode.QuickEdit}
        variables={[{ name: "learner" }]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const host = canvas.getByTestId("editor-host");
    const root = host.querySelector(".markdown-flow-editor")!;
    expect(root).not.toHaveAttribute("dir");
    await userEvent.click(
      canvas.getByRole("button", {
        name: getEditorLocaleMessages().toolbarInsertImage,
      })
    );
    const dialog = await page.findByRole("dialog");
    await waitFor(() => expect(getComputedStyle(dialog).direction).toBe("rtl"));
    expectDialogClosePlacement(
      dialog,
      getEditorLocaleMessages().dialogCloseLabel
    );
    host.dir = "ltr";
    await waitFor(() => expect(getComputedStyle(dialog).direction).toBe("ltr"));
    expectDialogClosePlacement(
      dialog,
      getEditorLocaleMessages().dialogCloseLabel
    );
    await userEvent.click(
      within(dialog).getByRole("button", {
        name: getEditorLocaleMessages().dialogCloseLabel,
      })
    );
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await userEvent.click(
      host.querySelector<HTMLElement>(".tag-variable .tag-placeholder-content")!
    );
    const popover = await page.findByRole("dialog");
    await waitFor(() =>
      expect(getComputedStyle(popover).direction).toBe("ltr")
    );
    expectSearchAffordance(popover.querySelector("input")!);
    await expectVariablePopoverAnchor(host, popover, "ltr");
    host.dir = "rtl";
    await waitFor(() =>
      expect(getComputedStyle(popover).direction).toBe("rtl")
    );
    expectSearchAffordance(popover.querySelector("input")!);
    expect(root).not.toHaveAttribute("dir");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await userEvent.click(
      host.querySelector<HTMLElement>(".tag-variable .tag-placeholder-content")!
    );
    const rtlPopover = await page.findByRole("dialog");
    await expectVariablePopoverAnchor(host, rtlPopover, "rtl");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
  },
};

const mediaPlaceholderSource = [
  '<img src="https://example.com/unnamed.png">',
  "![](https://example.com/markdown.png)",
  '=== <img src="https://example.com/fixed.png"> ===',
  '<img src="https://example.com/alt.png" alt="Authored image alt">',
  '<img src="https://example.com/title.png" title="Authored image title">',
  "![Authored Markdown alt](https://example.com/authored.png)",
  '<iframe data-tag="video" src="https://example.com/video"></iframe>',
  '=== <iframe data-tag="video" src="https://example.com/fixed-video"></iframe> ===',
  '<iframe data-tag="video" data-title="Authored &amp; video" src="https://example.com/authored-video"></iframe>',
].join("\n");
const mediaPlaceholderLocales = ["ar-SA", "th-TH", "zh-CN", "en-US"] as const;

const MediaPlaceholderLocaleFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>("ar-SA");
  const [source, setSource] = useState("");
  return (
    <div>
      {mediaPlaceholderLocales.map((value) => (
        <button type="button" key={value} onClick={() => setLocale(value)}>
          {value}
        </button>
      ))}
      <MarkdownFlowEditor
        locale={locale}
        editMode={EditMode.QuickEdit}
        content={mediaPlaceholderSource}
        toolbarActionsRight={[
          {
            key: "source",
            label: "Read source",
            onClick: (api) => setSource(api.getContent()),
          },
        ]}
      />
      <output data-testid="media-source">{source}</output>
    </div>
  );
};

export const LocalizedMediaPlaceholders: Story = {
  render: () => <MediaPlaceholderLocaleFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvasElement.querySelector(".cm-editor");
    for (const locale of [...mediaPlaceholderLocales, "ar-SA"] as const) {
      await userEvent.click(canvas.getByRole("button", { name: locale }));
      const texts = getEditorLocaleMessages(locale);
      await waitFor(() => {
        const images = canvasElement.querySelectorAll<HTMLElement>(
          ".tag-image .tag-placeholder-label"
        );
        const videos = canvasElement.querySelectorAll<HTMLElement>(
          ".tag-video .tag-placeholder-label"
        );
        expect(Array.from(images, (label) => label.textContent)).toEqual([
          texts.imageDefaultTitle,
          texts.imageDefaultTitle,
          texts.imageDefaultTitle,
          "Authored image alt",
          "Authored image title",
          "Authored Markdown alt",
        ]);
        expect(Array.from(videos, (label) => label.textContent)).toEqual([
          texts.videoDefaultTitle,
          texts.videoDefaultTitle,
          "Authored & video",
        ]);
        expect(images[0].dataset.title).toBe("");
        expect(videos[0].dataset.title).toBe("");
        expect(
          canvasElement.querySelectorAll(".tag-fixed-output-marker")
        ).toHaveLength(4);
      });
      expect(canvasElement.querySelector(".cm-editor")).toBe(editor);
      await userEvent.click(
        canvas.getByRole("button", { name: "Read source" })
      );
      expect(canvas.getByTestId("media-source").textContent).toBe(
        mediaPlaceholderSource
      );
    }
  },
};

const VariablePickerLocaleFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>("ar-SA");
  const [content, setContent] = useState("{{learner}}");
  return (
    <div style={{ width: 320, marginInline: "auto" }}>
      <button
        type="button"
        onClick={() => {
          setLocale("th-TH");
          setContent("{{learner}}");
        }}
      >
        Thai
      </button>
      <output data-testid="picker-content">{content}</output>
      <MarkdownFlowEditor
        locale={locale}
        editMode={EditMode.QuickEdit}
        content={content}
        onChange={setContent}
        variables={[{ name: "learner", label: "متعلم ผู้เรียน" }]}
        systemVariables={[{ name: "system", label: "نظام ระบบ" }]}
      />
    </div>
  );
};

export const VariablePickerDirection: Story = {
  render: () => <VariablePickerLocaleFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const openPicker = async () => {
      await userEvent.click(
        canvasElement.querySelector<HTMLElement>(
          ".tag-variable .tag-placeholder-content"
        )!
      );
      return page.findByRole("dialog");
    };
    for (const locale of ["ar-SA", "th-TH"] as const) {
      if (locale === "th-TH")
        await userEvent.click(canvas.getByRole("button", { name: "Thai" }));
      const picker = await openPicker();
      await expectVariablePopoverAnchor(
        canvasElement,
        picker,
        locale === "ar-SA" ? "rtl" : "ltr"
      );
      for (const name of ["learner", "system"]) {
        const option = within(picker).getByText(name).closest("button")!;
        expect(getComputedStyle(option).direction).toBe(
          locale === "ar-SA" ? "rtl" : "ltr"
        );
        expect(getComputedStyle(option).textAlign).toBe("start");
      }
      const add = within(picker).getByRole("button", {
        name: getEditorLocaleMessages(locale).variableAddNew,
      });
      const iconStyle = getComputedStyle(add.querySelector("svg")!);
      expect(iconStyle.marginInlineEnd).toBe("8px");
      expect(iconStyle.marginInlineStart).toBe("0px");
      expect(getComputedStyle(add).justifyContent).toBe("flex-start");
      await userEvent.click(within(picker).getByText("system"));
      await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
      expect(canvas.getByTestId("picker-content")).toHaveTextContent(
        "{{system}}"
      );
      const reopened = await openPicker();
      await userEvent.click(
        within(reopened).getByRole("button", {
          name: getEditorLocaleMessages(locale).variableAddNew,
        })
      );
      const input = within(reopened).getByPlaceholderText(
        getEditorLocaleMessages(locale).variableNamePlaceholder
      );
      await userEvent.type(input, `added_${locale.slice(0, 2)}{Enter}`);
      await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
      expect(canvas.getByTestId("picker-content")).toHaveTextContent(
        `{{added_${locale.slice(0, 2)}}}`
      );
    }
  },
};

export const ArabicVariableDropdown: Story = {
  parameters: { dropdownLocale: "ar-SA" },
  render: (_args, { parameters }) => (
    <div style={{ width: 320, marginLeft: "auto" }}>
      <MarkdownFlowEditor
        locale={parameters.dropdownLocale}
        variables={[
          {
            name: "learner",
            label: parameters.dropdownLocale === "ar-SA" ? "متعلم" : "ผู้เรียน",
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: getEditorLocaleMessages(parameters.dropdownLocale)
        .toolbarInsertExistingVariable,
    });
    await userEvent.click(trigger);
    await waitFor(() => {
      const panel = canvasElement.querySelector(
        ".markdown-flow-editor-variable-search"
      )!;
      expect(panel).not.toBeNull();
      expectSearchAffordance(panel.querySelector("input")!);
      const rect = panel.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(8);
      expect(rect.right).toBeLessThanOrEqual(
        canvasElement.ownerDocument.documentElement.clientWidth - 8
      );
      if (parameters.dropdownLocale === "ar-SA") {
        expect(rect.right).toBeCloseTo(
          trigger.getBoundingClientRect().right,
          0
        );
      }
      const item = panel.querySelector(".variable-search-item")!;
      expect(item).not.toBeNull();
      for (const element of [
        item,
        ...item.querySelectorAll(
          ".variable-search-item-name, .variable-search-item-label"
        ),
      ]) {
        const style = getComputedStyle(element);
        expect(style.direction).toBe(
          parameters.dropdownLocale === "ar-SA" ? "rtl" : "ltr"
        );
        expect(style.textAlign).toBe("start");
      }
    });
  },
};

export const ThaiVariableDropdown: Story = {
  ...ArabicVariableDropdown,
  parameters: { dropdownLocale: "th-TH" },
};

export const SandboxFullscreenPlacement: Story = {
  render: () => (
    <div dir="rtl">
      {(["ar-SA", "th-TH", undefined] as const).map((locale) => (
        <div key={locale ?? "inherit"} data-testid={locale ?? "inherit"}>
          <IframeSandbox
            type="markdown"
            mode="blackboard"
            content="Fullscreen content"
            locale={locale}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of ["ar-SA", "th-TH", "inherit"]) {
      const root = canvas
        .getByTestId(locale)
        .querySelector<HTMLElement>(".content-render-iframe-sandbox")!;
      const button = root.querySelector("button")!;
      const rtl = locale !== "th-TH";
      expect(getComputedStyle(button).insetInlineEnd).toBe("8px");
      const rect = root.getBoundingClientRect();
      const control = button.getBoundingClientRect();
      expect(
        rtl ? control.left - rect.left : rect.right - control.right
      ).toBeCloseTo(8, 0);
      expect(button).toBeEnabled();
      expect(button).toHaveTextContent(
        getContentRenderLocaleTexts(locale === "inherit" ? undefined : locale)
          .sandboxFullscreenButtonText
      );
    }
  },
};

const InheritedSandboxFixture = () => {
  const [direction, setDirection] = useState("rtl");
  const [locale, setLocale] = useState<MarkdownFlowLocale>();
  return (
    <div dir={direction}>
      <button
        type="button"
        onClick={() => setDirection(direction === "rtl" ? "ltr" : "rtl")}
      >
        Change host
      </button>
      <button type="button" onClick={() => setLocale("th-TH")}>
        Thai override
      </button>
      {(["content", "blackboard"] as const).map((mode) => (
        <div key={mode} data-testid={`inherited-${mode}`}>
          <IframeSandbox
            mode={mode}
            type="sandbox"
            locale={locale}
            content={
              '<div><p>Inherited content</p><p dir="ltr">Authored LTR</p><p dir="rtl">نص عربي</p></div>'
            }
          />
        </div>
      ))}
    </div>
  );
};

export const InheritedSandboxDirection: Story = {
  render: () => <InheritedSandboxFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const check = async (direction: string) => {
      await waitFor(() => {
        for (const mode of ["content", "blackboard"]) {
          const iframe = canvas
            .getByTestId(`inherited-${mode}`)
            .querySelector("iframe")!;
          const paragraphs = iframe.contentDocument!.querySelectorAll("p");
          expect(paragraphs).toHaveLength(3);
          expect(
            iframe.contentWindow!.getComputedStyle(paragraphs[0]).direction
          ).toBe(direction);
          expect(
            iframe.contentWindow!.getComputedStyle(paragraphs[1]).direction
          ).toBe("ltr");
          expect(
            iframe.contentWindow!.getComputedStyle(paragraphs[2]).direction
          ).toBe("rtl");
        }
      });
    };
    await check("rtl");
    await userEvent.click(canvas.getByRole("button", { name: "Change host" }));
    await check("ltr");
    await userEvent.click(canvas.getByRole("button", { name: "Change host" }));
    await check("rtl");
    await userEvent.click(
      canvas.getByRole("button", { name: "Thai override" })
    );
    await check("ltr");
  },
};

const SandboxDirectionFixture = ({
  mode,
}: {
  mode: "content" | "blackboard";
}) => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>("ar-SA");
  const [content, setContent] = useState("");
  return (
    <div>
      <button type="button" onClick={() => setLocale("th-TH")}>
        Thai
      </button>
      <button type="button" onClick={() => setLocale("ar-SA")}>
        Arabic
      </button>
      <button
        type="button"
        onClick={() => setContent('<p>مرحبا</p><p dir="ltr">Code: 123</p>')}
      >
        Render content
      </button>
      <IframeSandbox
        type="sandbox"
        mode={mode}
        content={content}
        locale={locale}
      />
    </div>
  );
};

export const SandboxLocaleDirection: Story = {
  render: () => <SandboxDirectionFixture mode="content" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const iframe = canvasElement.querySelector("iframe")!;
    const checkLoadingDirection = async (
      locale: MarkdownFlowLocale,
      dir: string
    ) => {
      await waitFor(() => {
        const status =
          iframe.contentDocument!.querySelector('[role="status"]')!;
        expect(status).not.toBeNull();
        expect(status).toHaveTextContent(
          getContentRenderLocaleTexts(locale).sandboxLoadingText
        );
        expect(iframe.contentWindow!.getComputedStyle(status).direction).toBe(
          dir
        );
      });
    };
    await checkLoadingDirection("ar-SA", "rtl");
    await userEvent.click(canvas.getByRole("button", { name: "Thai" }));
    await checkLoadingDirection("th-TH", "ltr");
    await userEvent.click(canvas.getByRole("button", { name: "Arabic" }));
    await checkLoadingDirection("ar-SA", "rtl");
    await userEvent.click(
      canvas.getByRole("button", { name: "Render content" })
    );
    await waitFor(() => {
      const paragraphs = iframe.contentDocument!.querySelectorAll("p");
      expect(paragraphs).toHaveLength(2);
      expect(
        iframe.contentWindow!.getComputedStyle(paragraphs[0]).direction
      ).toBe("rtl");
      expect(
        iframe.contentWindow!.getComputedStyle(paragraphs[1]).direction
      ).toBe("ltr");
    });
  },
};

export const BlackboardLocaleDirection: Story = {
  ...SandboxLocaleDirection,
  render: () => <SandboxDirectionFixture mode="blackboard" />,
};
