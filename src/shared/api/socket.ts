import { type Socket, io } from "socket.io-client";

import { API_BASE_URL } from "./config";
import { tokenStorage } from "./token-storage";

let socket: null | Socket = null;

// Один сокет на всё приложение — открывается лениво по первому обращению
// (autoConnect: false), а не сразу при загрузке модуля.
function getSocket(): Socket {
  socket ??= io(API_BASE_URL, {
    auth: { token: tokenStorage.get()?.token },
    autoConnect: false,
  });
  return socket;
}

export function connectSocket(): Socket {
  const instance = getSocket();
  if (!instance.connected) instance.connect();
  return instance;
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
