export type CarouselApi = {
  rectOf: (id: string) => DOMRect | null;
  reveal: (id: string) => void;
  hide: (id: string, on: boolean) => void;
  focus: (id: string) => void;
};