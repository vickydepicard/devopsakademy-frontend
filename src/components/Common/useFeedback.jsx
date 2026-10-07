// Messages, confirmations : toujours affichés dans une modale (rendue par <DialogHost /> monté dans main.jsx).
import { useCallback } from "react";
import { showAlert, askConfirm } from "../../utils/dialog";

export const apiError = (e, fallback) => e?.response?.data?.message || (typeof e === "string" && e) || fallback;

export default function useFeedback() {
  const notify = useCallback((text, type = "error") => { showAlert(text, type); }, []);
  const confirm = useCallback((message, { confirmLabel, danger = true } = {}) => askConfirm(message, { confirmLabel, danger }), []);
  return { ui: null, notify, confirm };
}
