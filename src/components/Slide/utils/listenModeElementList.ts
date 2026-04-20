import type {
  Element,
  ElementAudioSegment,
  ElementSubtitleCue,
} from "../types";

const DEFAULT_AUDIO_POSITION = 0;

const MARKDOWN_VIDEO_IFRAME_PATTERN =
  /<iframe\b[^>]*\bdata-tag\s*=\s*(["'])video\1[^>]*>[\s\S]*?<\/iframe>/i;

export type RunStreamRawAudioSegment = ElementAudioSegment & {
  element_id?: string | null;
};

export type RunStreamAudioTrack = {
  position?: number;
  slide_id?: string;
  slideId?: string;
  audio_url?: string;
  audioUrl?: string;
  is_audio_streaming?: boolean;
  isAudioStreaming?: boolean;
  audio_segments?: RunStreamRawAudioSegment[];
  audioSegments?: RunStreamRawAudioSegment[];
  subtitle_cues?: ElementSubtitleCue[];
  subtitleCues?: ElementSubtitleCue[];
};

export type RunStreamPayload = {
  audio?: RunStreamAudioTrack | null;
  audio_tracks?: RunStreamAudioTrack[];
  audioTracks?: RunStreamAudioTrack[];
  previous_visuals?: unknown[];
};

export type RunStreamFixtureRecord = {
  element_bid?: string;
  target_element_bid?: string;
  generated_block_bid?: string;
  element_type?: string;
  content?: Element["content"];
  is_marker?: boolean;
  is_renderable?: boolean;
  is_new?: boolean;
  is_speakable?: boolean;
  audio_url?: string;
  audioUrl?: string;
  audio_segments?: RunStreamRawAudioSegment[];
  audioTracks?: RunStreamAudioTrack[];
  audio_tracks?: RunStreamAudioTrack[];
  is_audio_streaming?: boolean;
  isAudioStreaming?: boolean;
  subtitle_cues?: ElementSubtitleCue[];
  payload?: RunStreamPayload | null;
  user_input?: string;
  readonly?: boolean;
  page?: number;
  sequence_number?: number;
  run_event_seq?: number;
};

export type RunStreamFixtureEvent = {
  type?: string;
  event_type?: string;
  content?: RunStreamFixtureRecord | null;
  run_event_seq?: number;
  generated_block_bid?: string;
};

export type RunStreamFixtureElement = Element & {
  element_bid: string;
  blockBid?: string;
  page?: number;
  run_event_seq?: number;
  is_audio_streaming?: boolean;
  isAudioStreaming?: boolean;
};

const sortRunStreamSubtitleCues = (subtitleCues: ElementSubtitleCue[] = []) =>
  [...subtitleCues].sort(
    (prevCue, nextCue) =>
      Number(prevCue.start_ms ?? 0) - Number(nextCue.start_ms ?? 0) ||
      Number(prevCue.end_ms ?? 0) - Number(nextCue.end_ms ?? 0) ||
      Number(prevCue.position ?? 0) - Number(nextCue.position ?? 0) ||
      Number(prevCue.segment_index ?? 0) - Number(nextCue.segment_index ?? 0)
  );

const normalizeRunStreamSubtitleCue = (
  subtitleCue?: ElementSubtitleCue | null
): ElementSubtitleCue | null => {
  if (!subtitleCue || typeof subtitleCue.text !== "string") {
    return null;
  }

  const normalizedText = subtitleCue.text.trim();

  if (!normalizedText) {
    return null;
  }

  return {
    text: normalizedText,
    start_ms: Math.max(Number(subtitleCue.start_ms ?? 0), 0),
    end_ms: Math.max(Number(subtitleCue.end_ms ?? 0), 0),
    segment_index: Number(subtitleCue.segment_index ?? 0),
    position:
      subtitleCue.position == null ? undefined : Number(subtitleCue.position),
  };
};

const normalizeRunStreamSubtitleCues = (
  subtitleCues?: ElementSubtitleCue[] | null
) =>
  sortRunStreamSubtitleCues(
    (Array.isArray(subtitleCues) ? subtitleCues : [])
      .map((subtitleCue) => normalizeRunStreamSubtitleCue(subtitleCue))
      .filter((subtitleCue): subtitleCue is ElementSubtitleCue =>
        Boolean(
          subtitleCue &&
          subtitleCue.end_ms >= subtitleCue.start_ms &&
          Number.isFinite(subtitleCue.start_ms) &&
          Number.isFinite(subtitleCue.end_ms) &&
          Number.isFinite(subtitleCue.segment_index)
        )
      )
  );

const buildRunStreamSubtitleCueUniqueKey = (subtitleCue: ElementSubtitleCue) =>
  [
    subtitleCue.text,
    String(subtitleCue.start_ms),
    String(subtitleCue.end_ms),
    String(subtitleCue.segment_index),
    String(subtitleCue.position ?? ""),
  ].join(":");

const mergeRunStreamSubtitleCues = (
  subtitleCues: ElementSubtitleCue[] = []
) => {
  const mergedSubtitleCueMap = new Map<string, ElementSubtitleCue>();

  normalizeRunStreamSubtitleCues(subtitleCues).forEach((subtitleCue) => {
    mergedSubtitleCueMap.set(
      buildRunStreamSubtitleCueUniqueKey(subtitleCue),
      subtitleCue
    );
  });

  return sortRunStreamSubtitleCues(Array.from(mergedSubtitleCueMap.values()));
};

type RunStreamAudioSegment = RunStreamRawAudioSegment;

type NormalizedRunStreamAudioTrack = {
  position: number;
  slide_id?: string;
  audio_url?: string;
  is_audio_streaming?: boolean;
  audio_segments: RunStreamAudioSegment[];
  subtitle_cues: ElementSubtitleCue[];
};

type RunStreamStoryItemType = "content" | "interaction";

const normalizeRunStreamAudioPosition = (position?: number | null) =>
  Number(position ?? DEFAULT_AUDIO_POSITION);

const sortRunStreamAudioSegments = (segments: RunStreamAudioSegment[] = []) =>
  [...segments].sort(
    (prevSegment, nextSegment) =>
      normalizeRunStreamAudioPosition(prevSegment.position) -
        normalizeRunStreamAudioPosition(nextSegment.position) ||
      Number(prevSegment.segment_index ?? 0) -
        Number(nextSegment.segment_index ?? 0)
  );

const sortRunStreamAudioTracks = (
  tracks: NormalizedRunStreamAudioTrack[] = []
) =>
  [...tracks].sort(
    (prevTrack, nextTrack) => prevTrack.position - nextTrack.position
  );

const buildRunStreamAudioSegmentUniqueKey = (
  elementBid: string,
  segment: RunStreamAudioSegment
) =>
  [
    elementBid,
    String(segment.element_id ?? ""),
    normalizeRunStreamAudioPosition(segment.position),
    Number(segment.segment_index ?? 0),
  ].join(":");

const normalizeRunStreamAudioSegment = (
  segment?: RunStreamAudioSegment | null
): RunStreamAudioSegment | null => {
  if (
    !segment ||
    segment.segment_index === undefined ||
    typeof segment.audio_data !== "string" ||
    !segment.audio_data
  ) {
    return null;
  }

  return {
    ...segment,
    position: normalizeRunStreamAudioPosition(segment.position),
    duration_ms: Number(segment.duration_ms ?? 0),
    is_final: Boolean(segment.is_final),
  };
};

const mergeRunStreamAudioSegmentByUniqueKey = (
  elementBid: string,
  segments: RunStreamAudioSegment[],
  incomingSegment: RunStreamAudioSegment
) => {
  const incomingKey = buildRunStreamAudioSegmentUniqueKey(
    elementBid,
    incomingSegment
  );
  const duplicatedIndex = segments.findIndex(
    (segment) =>
      buildRunStreamAudioSegmentUniqueKey(elementBid, segment) === incomingKey
  );

  if (duplicatedIndex < 0) {
    return sortRunStreamAudioSegments([...segments, incomingSegment]);
  }

  const duplicatedSegment = segments[duplicatedIndex];
  const mergedDuplicatedSegment: RunStreamAudioSegment = {
    ...duplicatedSegment,
    ...incomingSegment,
    is_final: Boolean(duplicatedSegment?.is_final || incomingSegment.is_final),
    position: normalizeRunStreamAudioPosition(
      incomingSegment.position ?? duplicatedSegment?.position
    ),
    audio_data:
      incomingSegment.audio_data || duplicatedSegment?.audio_data || "",
    duration_ms:
      incomingSegment.duration_ms ?? duplicatedSegment?.duration_ms ?? 0,
  };
  const nextSegments = [...segments];
  nextSegments[duplicatedIndex] = mergedDuplicatedSegment;

  return sortRunStreamAudioSegments(nextSegments);
};

const mergeRunStreamAudioSegments = (
  elementBid: string,
  segments: RunStreamAudioSegment[] = []
) =>
  segments.reduce<RunStreamAudioSegment[]>((result, segment) => {
    const normalizedSegment = normalizeRunStreamAudioSegment(segment);

    if (!normalizedSegment) {
      return result;
    }

    return mergeRunStreamAudioSegmentByUniqueKey(
      elementBid,
      result,
      normalizedSegment
    );
  }, []);

const getTrackAudioSegments = (track?: RunStreamAudioTrack | null) =>
  mergeRunStreamAudioSegments("", [
    ...(Array.isArray(track?.audioSegments) ? track.audioSegments : []),
    ...(Array.isArray(track?.audio_segments) ? track.audio_segments : []),
  ] as RunStreamAudioSegment[]);

const getTrackSubtitleCues = (track?: RunStreamAudioTrack | null) =>
  mergeRunStreamSubtitleCues([
    ...(Array.isArray(track?.subtitleCues) ? track.subtitleCues : []),
    ...(Array.isArray(track?.subtitle_cues) ? track.subtitle_cues : []),
  ]);

const normalizeRunStreamAudioTracks = (
  record: Pick<
    RunStreamFixtureRecord,
    "audioTracks" | "audio_tracks" | "payload"
  >
) => {
  const trackByPosition = new Map<number, NormalizedRunStreamAudioTrack>();
  const rawTracks = [
    ...(Array.isArray(record.audioTracks) ? record.audioTracks : []),
    ...(Array.isArray(record.audio_tracks) ? record.audio_tracks : []),
    ...(record.payload?.audio ? [record.payload.audio] : []),
    ...(Array.isArray(record.payload?.audioTracks)
      ? record.payload.audioTracks
      : []),
    ...(Array.isArray(record.payload?.audio_tracks)
      ? record.payload.audio_tracks
      : []),
  ];

  rawTracks.forEach((track) => {
    const position = normalizeRunStreamAudioPosition(track.position);
    const previousTrack = trackByPosition.get(position);
    trackByPosition.set(position, {
      position,
      slide_id: track.slide_id ?? track.slideId ?? previousTrack?.slide_id,
      audio_url: track.audio_url ?? track.audioUrl ?? previousTrack?.audio_url,
      is_audio_streaming: Boolean(
        track.is_audio_streaming ??
        track.isAudioStreaming ??
        previousTrack?.is_audio_streaming
      ),
      audio_segments: mergeRunStreamAudioSegments("", [
        ...(previousTrack?.audio_segments ?? []),
        ...getTrackAudioSegments(track),
      ]),
      subtitle_cues: mergeRunStreamSubtitleCues([
        ...(previousTrack?.subtitle_cues ?? []),
        ...getTrackSubtitleCues(track),
      ]),
    });
  });

  return sortRunStreamAudioTracks(Array.from(trackByPosition.values()));
};

const hasAudioContentInTrack = (
  track?: Pick<
    NormalizedRunStreamAudioTrack,
    "audio_url" | "is_audio_streaming" | "audio_segments"
  > | null
) =>
  Boolean(
    track?.audio_url ||
    track?.is_audio_streaming ||
    (track?.audio_segments?.length ?? 0) > 0
  );

const getAudioSegmentDataListFromTracks = (
  tracks: NormalizedRunStreamAudioTrack[] = []
) => sortRunStreamAudioTracks(tracks).flatMap((track) => track.audio_segments);

const getSubtitleCueDataListFromTracks = (
  tracks: NormalizedRunStreamAudioTrack[] = []
) => sortRunStreamAudioTracks(tracks).flatMap((track) => track.subtitle_cues);

const resolveRunStreamElementBid = (
  record?: Pick<
    RunStreamFixtureRecord,
    "element_bid" | "generated_block_bid" | "target_element_bid"
  > | null
) =>
  String(
    record?.target_element_bid ||
      record?.element_bid ||
      record?.generated_block_bid ||
      ""
  ).trim();

const resolveRunStreamStoryItemType = (
  elementType: Element["type"]
): RunStreamStoryItemType =>
  elementType === "interaction" ? "interaction" : "content";

const normalizeRunStreamSequenceNumber = (sequenceNumber: unknown) => {
  const normalizedSequenceNumber = Number(sequenceNumber);
  return Number.isFinite(normalizedSequenceNumber) &&
    normalizedSequenceNumber > 0
    ? normalizedSequenceNumber
    : null;
};

const buildRunStreamStreamKey = ({
  itemType,
  elementBid,
  fallbackSequence,
}: {
  itemType: RunStreamStoryItemType;
  elementBid: string;
  fallbackSequence: number;
}) =>
  elementBid
    ? `${itemType}:${elementBid}`
    : `${itemType}:fallback-${fallbackSequence}`;

const resolveRunStreamRenderSequence = ({
  sequenceMap,
  occupiedSequenceNumbers,
  itemType,
  elementBid,
  incomingSequenceNumber,
  fallbackSequence,
}: {
  sequenceMap: Map<string, number>;
  occupiedSequenceNumbers: Set<number>;
  itemType: RunStreamStoryItemType;
  elementBid: string;
  incomingSequenceNumber: number | null;
  fallbackSequence: number;
}) => {
  const streamKey = buildRunStreamStreamKey({
    itemType,
    elementBid,
    fallbackSequence,
  });
  const existingSequence = sequenceMap.get(streamKey);

  if (typeof existingSequence === "number") {
    occupiedSequenceNumbers.add(existingSequence);
    return existingSequence;
  }

  const hasOccupiedSequenceNumber = (nextSequenceNumber: number) => {
    if (occupiedSequenceNumbers.has(nextSequenceNumber)) {
      return true;
    }

    for (const [
      mappedStreamKey,
      mappedSequenceNumber,
    ] of sequenceMap.entries()) {
      if (mappedStreamKey === streamKey) {
        continue;
      }
      if (mappedSequenceNumber === nextSequenceNumber) {
        return true;
      }
    }

    return false;
  };

  let nextSequenceNumber = incomingSequenceNumber ?? fallbackSequence;
  while (hasOccupiedSequenceNumber(nextSequenceNumber)) {
    nextSequenceNumber += 1;
  }

  sequenceMap.set(streamKey, nextSequenceNumber);
  occupiedSequenceNumbers.add(nextSequenceNumber);

  return nextSequenceNumber;
};

const resolveListenModeLikeAudioSource = (
  record: RunStreamFixtureRecord,
  elementBid: string
) => {
  const normalizedTracks = normalizeRunStreamAudioTracks(record);
  const playableTracks = normalizedTracks.filter((track) =>
    hasAudioContentInTrack(track)
  );

  if (playableTracks.length > 0) {
    const trackAudioSegments = mergeRunStreamAudioSegments(
      elementBid,
      getAudioSegmentDataListFromTracks(playableTracks)
    );
    const trackSubtitleCues = mergeRunStreamSubtitleCues(
      getSubtitleCueDataListFromTracks(playableTracks)
    );

    return {
      audioUrl: playableTracks.find((track) => track.audio_url)?.audio_url,
      audioSegments:
        trackAudioSegments.length > 0 ? trackAudioSegments : undefined,
      subtitleCues:
        trackSubtitleCues.length > 0 ? trackSubtitleCues : undefined,
      isAudioStreaming: playableTracks.some((track) =>
        Boolean(track.is_audio_streaming)
      ),
    };
  }

  const legacyAudioSegments = mergeRunStreamAudioSegments(
    elementBid,
    Array.isArray(record.audio_segments)
      ? (record.audio_segments as RunStreamAudioSegment[])
      : []
  );

  return {
    audioUrl: record.audio_url ?? record.audioUrl ?? "",
    audioSegments:
      legacyAudioSegments.length > 0 ? legacyAudioSegments : undefined,
    subtitleCues: mergeRunStreamSubtitleCues([
      ...(Array.isArray(record.subtitle_cues) ? record.subtitle_cues : []),
      ...(Array.isArray(record.payload?.audio?.subtitleCues)
        ? record.payload.audio.subtitleCues
        : []),
      ...(Array.isArray(record.payload?.audio?.subtitle_cues)
        ? record.payload.audio.subtitle_cues
        : []),
    ]),
    isAudioStreaming:
      typeof record.isAudioStreaming === "boolean"
        ? record.isAudioStreaming
        : typeof record.is_audio_streaming === "boolean"
          ? record.is_audio_streaming
          : legacyAudioSegments.some((segment) => !segment.is_final),
  };
};

const resolveListenModeLikeElementType = (
  record: Pick<RunStreamFixtureRecord, "content" | "element_type">
) => {
  const normalizedContent =
    typeof record.content === "string" ? record.content.trim() : "";

  if (MARKDOWN_VIDEO_IFRAME_PATTERN.test(normalizedContent)) {
    return "video";
  }

  return String(record.element_type ?? "").trim() || "text";
};

const reindexRunStreamPagesLikeListenMode = (
  elementList: RunStreamFixtureElement[]
) => {
  let pageCursor = 0;

  return elementList.map((element) => {
    if (element.type === "interaction") {
      return {
        ...element,
        page: Math.max(pageCursor - 1, 0),
      };
    }

    const nextElement = {
      ...element,
      page: pageCursor,
    };
    pageCursor += 1;

    return nextElement;
  });
};

const buildRunStreamActiveStreamKeys = (
  elementList: RunStreamFixtureElement[]
) =>
  new Set(
    elementList.map((element, index) =>
      buildRunStreamStreamKey({
        itemType: resolveRunStreamStoryItemType(element.type),
        elementBid: String(element.element_bid ?? "").trim(),
        fallbackSequence:
          normalizeRunStreamSequenceNumber(element.sequence_number) ??
          index + 1,
      })
    )
  );

const pruneRunStreamSequenceMap = (
  sequenceMap: Map<string, number>,
  activeStreamKeys: Set<string>
) => {
  for (const streamKey of Array.from(sequenceMap.keys())) {
    if (activeStreamKeys.has(streamKey)) {
      continue;
    }
    sequenceMap.delete(streamKey);
  }
};

export const normalizeRunStreamElement = (
  record: RunStreamFixtureRecord,
  fallbackEventSeq: number
): RunStreamFixtureElement | null => {
  const elementBid = resolveRunStreamElementBid(record);
  const type = resolveListenModeLikeElementType(record);

  if (!elementBid || !type) {
    return null;
  }

  const { audioUrl, audioSegments, subtitleCues, isAudioStreaming } =
    resolveListenModeLikeAudioSource(record, elementBid);

  return {
    sequence_number: Number(record.sequence_number ?? 0),
    type,
    content: record.content ?? "",
    is_marker: record.is_marker ?? true,
    is_renderable: record.is_renderable ?? true,
    is_new: record.is_new ?? true,
    is_speakable:
      record.is_speakable ?? Boolean(audioUrl || audioSegments?.length),
    audio_url: audioUrl,
    audio_segments: audioSegments,
    subtitle_cues: subtitleCues,
    user_input: record.user_input ?? "",
    readonly: Boolean(record.readonly),
    element_bid: elementBid,
    blockBid: elementBid,
    page: Number(record.page ?? 0),
    run_event_seq: Number(record.run_event_seq ?? fallbackEventSeq ?? 0),
    is_audio_streaming: isAudioStreaming,
    isAudioStreaming: isAudioStreaming,
  };
};

export const upsertRunStreamElementList = ({
  currentList,
  nextElement,
  sequenceMap,
}: {
  currentList: RunStreamFixtureElement[];
  nextElement: RunStreamFixtureElement;
  sequenceMap: Map<string, number>;
}) => {
  const hitIndex = currentList.findIndex(
    (element) => element.element_bid === nextElement.element_bid
  );
  const nextList = [...currentList];
  const previousElement = hitIndex >= 0 ? nextList[hitIndex] : null;
  const previousAudioSegments = Array.isArray(previousElement?.audio_segments)
    ? (previousElement.audio_segments as RunStreamAudioSegment[])
    : [];
  const incomingAudioSegments = Array.isArray(nextElement.audio_segments)
    ? (nextElement.audio_segments as RunStreamAudioSegment[])
    : [];
  const mergedAudioSegments = mergeRunStreamAudioSegments(
    nextElement.element_bid,
    [...previousAudioSegments, ...incomingAudioSegments]
  );
  const occupiedSequenceNumbers = currentList.reduce<Set<number>>(
    (result, element, index) => {
      if (index === hitIndex) {
        return result;
      }

      const sequenceNumber = normalizeRunStreamSequenceNumber(
        element.sequence_number
      );
      if (sequenceNumber !== null) {
        result.add(sequenceNumber);
      }

      return result;
    },
    new Set<number>()
  );
  const fallbackSequence = Math.max(
    currentList.length + (hitIndex >= 0 ? 0 : 1),
    1
  );
  const resolvedSequenceNumber = resolveRunStreamRenderSequence({
    sequenceMap,
    occupiedSequenceNumbers,
    itemType: resolveRunStreamStoryItemType(nextElement.type),
    elementBid: nextElement.element_bid,
    incomingSequenceNumber: normalizeRunStreamSequenceNumber(
      previousElement?.sequence_number ?? nextElement.sequence_number
    ),
    fallbackSequence,
  });
  const mergedElement: RunStreamFixtureElement = {
    ...(previousElement ?? nextElement),
    ...nextElement,
    sequence_number: resolvedSequenceNumber,
    audio_url: nextElement.audio_url || previousElement?.audio_url || "",
    audio_segments:
      mergedAudioSegments.length > 0
        ? mergedAudioSegments
        : previousElement?.audio_segments,
    user_input: nextElement.user_input || previousElement?.user_input || "",
    readonly: nextElement.readonly ?? previousElement?.readonly ?? false,
    subtitle_cues: mergeRunStreamSubtitleCues([
      ...(previousElement?.subtitle_cues ?? []),
      ...(nextElement.subtitle_cues ?? []),
    ]),
  };

  if (hitIndex >= 0) {
    nextList[hitIndex] = mergedElement;
  } else {
    nextList.push(mergedElement);
  }

  const sortedList = nextList.sort(
    (prevElement, nextItem) =>
      Number(prevElement.sequence_number ?? 0) -
        Number(nextItem.sequence_number ?? 0) ||
      Number(prevElement.run_event_seq ?? 0) -
        Number(nextItem.run_event_seq ?? 0)
  );
  const pageAlignedList = reindexRunStreamPagesLikeListenMode(sortedList);

  pruneRunStreamSequenceMap(
    sequenceMap,
    buildRunStreamActiveStreamKeys(pageAlignedList)
  );

  return pageAlignedList;
};

export const buildRunStreamElementListFromEvents = ({
  events,
  sequenceMap = new Map<string, number>(),
}: {
  events: RunStreamFixtureEvent[];
  sequenceMap?: Map<string, number>;
}) =>
  events.reduce<RunStreamFixtureElement[]>((elementList, event) => {
    if (event?.type !== "element" || !event.content) {
      return elementList;
    }

    const normalizedElement = normalizeRunStreamElement(
      event.content,
      Number(event.run_event_seq ?? 0)
    );
    if (!normalizedElement) {
      return elementList;
    }

    return upsertRunStreamElementList({
      currentList: elementList,
      nextElement: normalizedElement,
      sequenceMap,
    });
  }, []);
