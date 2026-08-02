import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true только после монтирования на клиенте — защита от рассинхрона с SSR/порталами. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
