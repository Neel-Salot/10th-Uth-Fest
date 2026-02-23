export const LiquidStore = {
    scrollY: 0,
    mouse: { x: 0, y: 0, vX: 0, vY: 0 },
    hoverTarget: 'default' as 'default' | 'play' | 'physics',
    videos: [] as { id: string, rect: DOMRect, element: HTMLVideoElement, visible: boolean }[],
    isMobile: false,
    setScroll: (y: number) => { LiquidStore.scrollY = y; },
    setMouse: (x: number, y: number) => {
        LiquidStore.mouse.vX = x - LiquidStore.mouse.x;
        LiquidStore.mouse.vY = y - LiquidStore.mouse.y;
        LiquidStore.mouse.x = x;
        LiquidStore.mouse.y = y;
    },
    setHover: (type: 'default' | 'play' | 'physics') => { LiquidStore.hoverTarget = type; }
};

export const registerVideo = (id: string, element: HTMLVideoElement, rect: DOMRect) => {
    const existing = LiquidStore.videos.find(v => v.id === id);
    if (existing) {
        existing.element = element;
        existing.rect = rect;
    } else {
        LiquidStore.videos.push({ id, element, rect, visible: false });
    }
};

export const updateVideoRect = (id: string, rect: DOMRect, visible: boolean) => {
    const existing = LiquidStore.videos.find(v => v.id === id);
    if (existing) {
        existing.rect = rect;
        existing.visible = visible;
    }
};
