export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum HistoryItemType {
  Edit,
  Source,
}

export interface HistoryItemEdit<E, S> {
  type: HistoryItemType.Edit;
  data: E;
  source: HistoryItemSource<S, E>;
}

export interface HistoryItemSource<S, E> {
  name: string;
  type: HistoryItemType.Source;
  data: S;
  isSelected?: boolean;
  editHistory: HistoryItemEdit<E, S>[];
  draw: (
    ctx: CanvasRenderingContext2D,
    action: HistoryItemSource<S, E>,
  ) => void;
  isHit?: (
    ctx: CanvasRenderingContext2D,
    action: HistoryItemSource<S, E>,
    point: Point,
  ) => boolean;
}

export type HistoryItem<S, E> = HistoryItemEdit<E, S> | HistoryItemSource<S, E>;

export interface History {
  index: number;

  stack: HistoryItem<any, any>[];
}

export interface RecorderShotsContext {
  url: string;
  imageEl: HTMLImageElement | null;
  width: number;
  height: number;
  canvasContextRef: CanvasRenderingContext2D | null;
  history: History;
  bounds: Bounds | null;
  cursor: string;
  operation: string;
}
