import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "~/shared/lib/store";
import { fetchImportJobs, setPolling } from "../importsSlice";
import { selectIsImportInProgress } from "../selectors";

const POLL_INTERVAL_MS = 5_000;

export function useImportPolling() {
  const dispatch = useAppDispatch();
  const isActive = useAppSelector(selectIsImportInProgress);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      dispatch(setPolling(true));
      intervalRef.current = setInterval(() => {
        void dispatch(fetchImportJobs());
      }, POLL_INTERVAL_MS);
    } else {
      dispatch(setPolling(false));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, dispatch]);
}
