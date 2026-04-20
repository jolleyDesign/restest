import type { Device, SafeArea } from "./types";

export type Context = "browser" | "pwa" | "fullscreen";

const ZERO: SafeArea = { top: 0, right: 0, bottom: 0, left: 0 };

function rotate(sa: SafeArea): SafeArea {
  return { top: sa.left, right: sa.top, bottom: sa.right, left: sa.bottom };
}

/**
 * Layout breakdown for a single device in a given context.
 * - `statusBar.height` is the OS system status bar height (== hardware top inset on notched devices).
 * - `addressBar.height` is the browser address bar added **below** the status bar (Browser only).
 * - `bottomToolbar.height` is the browser bottom toolbar (iOS Safari only), which includes the
 *    home-indicator area.
 * - `insets` is the final padding around the iframe within the screen rectangle.
 */
export interface Layout {
  insets: SafeArea;
  statusBar: { visible: boolean; height: number };
  addressBar: { visible: boolean; height: number };
  bottomToolbar: { visible: boolean; height: number };
}

export function computeLayout(
  device: Device,
  context: Context,
  rotated: boolean,
): Layout {
  const hw = rotated ? rotate(device.safeArea) : device.safeArea;
  const isApple = device.brand === "Apple";
  const isAndroid =
    device.brand === "Google" ||
    device.brand === "Samsung" ||
    device.brand === "Microsoft";
  const hasStatusBar =
    (isApple || isAndroid) &&
    (device.category === "phone" ||
      device.category === "foldable" ||
      device.category === "tablet");

  if (context === "fullscreen") {
    return {
      insets: ZERO,
      statusBar: { visible: false, height: 0 },
      addressBar: { visible: false, height: 0 },
      bottomToolbar: { visible: false, height: 0 },
    };
  }

  // Status bar occupies the hardware top inset.
  const statusBar = {
    visible: hasStatusBar && hw.top > 0,
    height: hw.top,
  };

  if (context === "pwa") {
    // Approximate observed real-world PWA behavior: most apps pad their top via
    // `padding-top: env(safe-area-inset-top)` to avoid clashing with the status bar,
    // but don't pad the bottom — content flows under the home indicator, which is
    // drawn as a translucent overlay on top of the page. We reserve the top but
    // leave the bottom open so the iframe extends to the edge of the screen.
    return {
      insets: { top: hw.top, right: hw.right, bottom: 0, left: hw.left },
      statusBar,
      addressBar: { visible: false, height: 0 },
      bottomToolbar: { visible: false, height: 0 },
    };
  }

  // Browser context: address bar stacks below the status bar; iOS also gets a bottom toolbar.
  const isPhone = device.category === "phone" || device.category === "foldable";
  const addressBarHeight = isApple ? (isPhone ? 44 : 48) : isAndroid ? 56 : 0;
  const bottomToolbarHeight = isApple && isPhone ? 44 : 0;

  return {
    insets: {
      top: hw.top + addressBarHeight,
      right: hw.right,
      bottom: hw.bottom + bottomToolbarHeight,
      left: hw.left,
    },
    statusBar,
    addressBar: { visible: addressBarHeight > 0, height: addressBarHeight },
    bottomToolbar: {
      visible: bottomToolbarHeight > 0,
      height: bottomToolbarHeight,
    },
  };
}
