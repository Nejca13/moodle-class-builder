/// <reference types="vite/client" />

import "react";

declare module "react" {
  interface DialogHTMLAttributes<T> extends HTMLAttributes<T> {
    /** https://developer.mozilla.org/docs/Web/HTML/Element/dialog#closedby */
    closedby?: "any" | "closerequest" | "none";
  }
}
