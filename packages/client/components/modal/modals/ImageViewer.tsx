import {
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  on,
  onCleanup,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";

import Panzoom, { PanzoomObject } from "@panzoom/panzoom";
import { css, cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { Column, Dialog, DialogProps, IconButton, Text } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { MessageContextMenu } from "@revolt/app";
import { Modals } from "../types";

export function ImageViewerModal(
  props: DialogProps & Modals & { type: "image_viewer" },
) {
  const [ref, setRef] = createSignal<HTMLElement>();

  let panzoom: PanzoomObject;

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 2) {
      panzoom.handleDown(e);
      return;
    }
  }

  let lastTapTime = 0;
  let pinchStartDist = 0;
  let pinchStartScale = 1;

  function getTouchDist(t1: Touch, t2: Touch) {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2 && panzoom) {
      pinchStartDist = getTouchDist(e.touches[0], e.touches[1]);
      pinchStartScale = panzoom.getScale();
    } else if (e.touches.length === 1 && panzoom) {
      const now = Date.now();
      if (now - lastTapTime < 280) {
        const nextScale = panzoom.getScale() > 1.4 ? 1 : 2.5;
        panzoom.zoomToPoint(nextScale, {
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
        });
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && panzoom && pinchStartDist > 0) {
      e.preventDefault();
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const nextScale = Math.min(5, Math.max(0.5, pinchStartScale * (dist / pinchStartDist)));
      panzoom.zoomToPoint(nextScale, { clientX: midX, clientY: midY });
    }
  }

  function onTouchEnd(e: TouchEvent) {
    if (e.touches.length < 2) pinchStartDist = 0;
  }

  function onMouseWheel(event: WheelEvent) {
    panzoom.zoom(panzoom.getScale() - event.deltaY / 1000);
  }

  createEffect(
    on(
      () => ref(),
      (ref) => {
        if (ref) {
          const zoom = Panzoom(ref, {
            minScale: 0.1,
            maxScale: 5,
            noBind: true,
          });

          panzoom = zoom;

          ref.style.touchAction = "none";
          ref.addEventListener("pointerdown", onPointerDown);
          ref.addEventListener("touchstart", onTouchStart, { passive: true });
          ref.addEventListener("touchmove", onTouchMove, { passive: false });
          ref.addEventListener("touchend", onTouchEnd);
          document.addEventListener("pointermove", panzoom.handleMove);
          document.addEventListener("pointerup", panzoom.handleUp);
          document.addEventListener("pointerleave", panzoom.handleUp);
          document.addEventListener("pointercancel", panzoom.handleUp);
          document.addEventListener("wheel", onMouseWheel as never);

          onCleanup(() => {
            ref.removeEventListener("pointerdown", onPointerDown);
            ref.removeEventListener("touchstart", onTouchStart);
            ref.removeEventListener("touchmove", onTouchMove);
            ref.removeEventListener("touchend", onTouchEnd);
            document.removeEventListener("pointercancel", panzoom.handleUp);
            document.removeEventListener("pointermove", panzoom.handleMove);
            document.removeEventListener("pointerup", panzoom.handleUp);
            document.removeEventListener("pointerleave", panzoom.handleUp);
            document.removeEventListener("wheel", onMouseWheel as never);
          });
        }
      },
    ),
  );

  return (
    <Portal mount={document.getElementById("floating")!}>
      <Dialog.Scrim
        dark
        padding={false}
        overflow={false}
        show={props.show}
        onClick={props.onClose}
      >
        <Presence>
          <Show when={props?.show}>
            <Motion.div
              class={css({
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",

                minHeight: 0,
                width: "100%",
                height: "100%",

                paddingInline: "20px",
              })}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{
                duration: 0.3,
                easing: [0.17, 0.67, 0.58, 0.98],
              }}
            >
              <Relative>
                <Bar>
                  <Switch fallback={<div />}>
                    <Match when={props.file}>
                      <Card onClick={(e) => e.stopPropagation()}>
                        <Column>
                          <Text class="title">{props.file!.filename}</Text>
                          <Text class="label">
                            {props.file!.humanReadableSize}
                          </Text>
                        </Column>
                      </Card>
                    </Match>
                  </Switch>
                  <Card onClick={(e) => e.stopPropagation()}>
                    <IconButton onPress={() => panzoom?.zoomOut()}>
                      <Symbol>zoom_out</Symbol>
                    </IconButton>
                    <IconButton onPress={() => panzoom?.zoomIn()}>
                      <Symbol>zoom_in</Symbol>
                    </IconButton>
                    <Show when={props.file}>
                      <a
                        target="_blank"
                        href={props.file?.originalUrl}
                        download={props.file?.filename}
                      >
                        <IconButton>
                          <Symbol>download</Symbol>
                        </IconButton>
                      </a>
                    </Show>
                    <Show when={props.embed || props.gif}>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={
                          props.originalUrl ||
                          props.embed?.url ||
                          props.gif?.url
                        }
                      >
                        <IconButton>
                          <Symbol>open_in_new</Symbol>
                        </IconButton>
                      </a>
                    </Show>
                    <IconButton onPress={props.onClose}>
                      <Symbol>close</Symbol>
                    </IconButton>
                  </Card>
                </Bar>
              </Relative>
              <Switch>
                <Match when={props.file}>
                  <img
                    class={Image()}
                    use:floating={{
                      contextMenu: () => (
                        <MessageContextMenu file={props.file} />
                      ),
                    }}
                    ref={setRef}
                    style={{
                      "aspect-ratio": `${(props.file!.metadata as { width: number }).width}/${(props.file!.metadata as { height: number }).height}`,
                    }}
                    src={props.file!.originalUrl}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </Match>
                <Match when={props.embed}>
                  <img
                    class={Image()}
                    ref={setRef}
                    use:floating={{
                      contextMenu: () => (
                        <MessageContextMenu file={props.embed} />
                      ),
                    }}
                    style={{
                      "aspect-ratio": `${props.embed!.width}/${props.embed!.height}`,
                    }}
                    src={props.embed!.proxiedURL}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Match>
                <Match when={props.gif}>
                  <video
                    class={Video()}
                    ref={setRef}
                    use:floating={{
                      contextMenu: () => (
                        <MessageContextMenu file={props.gif} />
                      ),
                    }}
                    playsinline
                    loop
                    muted
                    autoplay
                    style={{
                      "aspect-ratio": `${props.gif!.width}/${props.gif!.height}`,
                    }}
                    src={props.gif!.url}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Match>
              </Switch>
              <div />
            </Motion.div>
          </Show>
        </Presence>
      </Dialog.Scrim>
    </Portal>
  );
}

const Image = cva({
  base: {
    minHeight: 0,
    alignSelf: "center",
    objectFit: "contain",

    background: "rgba(0, 0, 0, 0.6)",
  },
});

const Video = cva({
  base: {
    minHeight: 0,
    alignSelf: "center",
    objectFit: "contain",

    background: "rgba(0, 0, 0, 0.6)",
  },
});

const Relative = styled("div", {
  base: {
    position: "relative",
  },
});

const Bar = styled("div", {
  base: {
    width: "100%",
    position: "absolute",

    height: "120px",
    flexShrink: 0,

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

const Card = styled("div", {
  base: {
    zIndex: 999,
    display: "flex",
    gap: "var(--gap-md)",
    padding: "var(--gap-md)",
    borderRadius: "var(--borderRadius-lg)",
    background: "var(--md-sys-color-surface)",
    color: "var(--md-sys-color-on-surface)",
  },
});
