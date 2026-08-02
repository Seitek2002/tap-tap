import { RouterProvider } from "react-router";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { queryClient } from "@/shared/config";

import { router } from "./router";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster containerStyle={{ top: 12 }} position="top-center" />
    </QueryClientProvider>
  );
}
