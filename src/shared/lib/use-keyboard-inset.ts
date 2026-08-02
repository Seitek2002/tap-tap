import { useEffect, useState } from "react";

// На Android/Chrome-based WebView раскладку под клавиатуру уже решает
// interactive-widget=resizes-content в index.html — layout-вьюпорт сам
// сжимается, и наши flex-h-dvh экраны реагируют без единой строчки JS.
// У iOS Safari/WKWebView такого мета-тега нет: клавиатура просто перекрывает
// контент отдельным слоем, а высота раскладки не меняется — отсюда этот хук
// как явный фолбэк через window.visualViewport, который у Android просто
// вернёт ~0 и ни на что не повлияет.
export const useKeyboardInset = () => {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const overlap =
        window.innerHeight - viewport.height - viewport.offsetTop;
      setInset(Math.max(0, Math.round(overlap)));
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
};
