import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface CardItem {
  src: string;
  alt: string;
}

interface CardCarouselProps {
  cards: CardItem[];
}

const DRAG_STEP_PX = 220;

/** Wrap an index into a circular list. */
function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

/** Find the shortest signed distance between two positions in a circular list. */
function shortestOffset(index: number, activeIndex: number, length: number): number {
  let offset = index - activeIndex;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

/** A draggable, infinitely wrapping card rail. */
export function CardCarousel({ cards }: CardCarouselProps) {
  const carouselRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const pointerStart = useRef({ x: 0, time: 0 });
  const lastPointer = useRef({ x: 0, time: 0, velocity: 0 });
  const wheelLocked = useRef(false);

  const moveBy = (steps: number) => {
    setActiveIndex((current) => wrapIndex(current + steps, cards.length));
  };

  const finishDrag = () => {
    if (!draggingRef.current) return;
    const projected = dragOffsetRef.current + lastPointer.current.velocity * 180;
    const steps = Math.max(-3, Math.min(3, Math.round(-projected / DRAG_STEP_PX)));
    if (steps) moveBy(steps);
    draggingRef.current = false;
    dragOffsetRef.current = 0;
    setDragging(false);
    setDragOffset(0);
  };

  useEffect(() => {
    const stopDrag = () => finishDrag();
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
    return () => {
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
    };
  });

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (wheelLocked.current || Math.abs(event.deltaX) + Math.abs(event.deltaY) < 8) return;
      wheelLocked.current = true;
      moveBy(event.deltaX + event.deltaY > 0 ? 1 : -1);
      window.setTimeout(() => (wheelLocked.current = false), 320);
    };
    carousel.addEventListener('wheel', handleWheel, { passive: false });
    return () => carousel.removeEventListener('wheel', handleWheel);
  });

  return (
    <section
      ref={carouselRef}
      className={`card-carousel${dragging ? ' card-carousel--dragging' : ''}`}
      aria-roledescription="carousel"
      aria-label="细菌卫士卡牌展示"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') moveBy(-1);
        if (event.key === 'ArrowRight') moveBy(1);
      }}
    >
      <div
        className="card-carousel__viewport"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          const now = performance.now();
          pointerStart.current = { x: event.clientX, time: now };
          lastPointer.current = { x: event.clientX, time: now, velocity: 0 };
          draggingRef.current = true;
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (!draggingRef.current) return;
          const now = performance.now();
          const elapsed = Math.max(now - lastPointer.current.time, 1);
          lastPointer.current = {
            x: event.clientX,
            time: now,
            velocity: (event.clientX - lastPointer.current.x) / elapsed,
          };
          const nextOffset = event.clientX - pointerStart.current.x;
          dragOffsetRef.current = nextOffset;
          setDragOffset(nextOffset);
        }}
      >
        <div className="card-carousel__rail">
          {cards.map((card, index) => {
            const baseOffset = shortestOffset(index, activeIndex, cards.length);
            const fluidOffset = baseOffset + dragOffset / DRAG_STEP_PX;
            const distance = Math.abs(fluidOffset);
            const visible = distance < 3.6;
            return (
              <figure
                className="card-carousel__card"
                data-active={baseOffset === 0 ? 'true' : 'false'}
                aria-hidden={baseOffset === 0 ? undefined : true}
                key={card.src}
                style={{
                  '--card-offset': fluidOffset,
                  '--card-scale': Math.max(0.62, 1 - distance * 0.14),
                  '--card-opacity': visible ? Math.max(0.2, 1 - distance * 0.26) : 0,
                  '--card-z': Math.max(1, 20 - Math.round(distance * 4)),
                  visibility: visible ? 'visible' : 'hidden',
                } as CSSProperties}
              >
                <img src={card.src} alt={card.alt} draggable={false} loading={index < 3 ? 'eager' : 'lazy'} />
              </figure>
            );
          })}
        </div>
      </div>

      <button className="card-carousel__button card-carousel__button--previous" type="button" onClick={() => moveBy(-1)} aria-label="上一张卡牌">
        <span aria-hidden="true">←</span>
      </button>
      <button className="card-carousel__button card-carousel__button--next" type="button" onClick={() => moveBy(1)} aria-label="下一张卡牌">
        <span aria-hidden="true">→</span>
      </button>
      <p className="card-carousel__status" aria-live="polite">
        <span>{String(activeIndex + 1).padStart(2, '0')}</span>
        <span aria-hidden="true"> / </span>
        <span>{String(cards.length).padStart(2, '0')}</span>
      </p>
    </section>
  );
}
