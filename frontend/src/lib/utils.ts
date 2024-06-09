import { backendURL } from "@/config";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const waitForElm = (selector: string) => {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

export const elementIsVisibleInViewport = (el: Element | null, partiallyVisible = false) => {
  if (!el) return false;
  const { top, left, bottom, right } = el.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  return partiallyVisible
    ? ((top > 0 && top < innerHeight) ||
      (bottom > 0 && bottom < innerHeight)) &&
    ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
    : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};

export const isImage = (fileName: string) => {
  return /\.(jpe?g|png|gif|bmp|tiff|webp)(\?.*)?$/i.test(fileName);
};

export const isVideo = (fileName: string) => {
  return /\.(mp4|webm|ogg|ogv)(\?.*)?$/i.test(fileName);
};


export const fileUrl = (file: any) => {
  return !file.url.startsWith("/uploads") ? file.url : backendURL + file.url
};