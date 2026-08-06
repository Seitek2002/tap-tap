import toast from "react-hot-toast";

import type { Profile } from "../model/profiles";
import { MatchToastCard } from "./match-toast-card";

const TOAST_DURATION = 4000;

/** Показывает тост «У вас новая пара!» — вызывается при взаимном лайке. */
export const showNewMatchToast = (profile: Profile, onClick?: () => void) => {
  toast.custom(
    (t) => <MatchToastCard onClick={onClick} profile={profile} t={t} />,
    {
      duration: TOAST_DURATION,
      position: "top-center",
    },
  );
};
