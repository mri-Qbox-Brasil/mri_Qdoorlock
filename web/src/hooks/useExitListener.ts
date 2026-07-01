import { useEffect, useRef } from 'react';
import { noop } from '../utils/misc';
import { fetchNui } from '../utils/fetchNui';

type FrameVisibleSetter = (bool: boolean) => void;

const LISTENED_KEYS = ['Escape'];

// Basic hook to listen for key presses in NUI in order to exit
export const useExitListener = (visibleSetter: FrameVisibleSetter, cb?: () => void, isEnabled: boolean = true) => {
  const setterRef = useRef<FrameVisibleSetter>(noop);
  const isEnabledRef = useRef(isEnabled);

  useEffect(() => {
    setterRef.current = visibleSetter;
  }, [visibleSetter]);

  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (LISTENED_KEYS.includes(e.code) && isEnabledRef.current) {
        setterRef.current(false);
        cb && cb()
        fetchNui('exit');
      }
    };

    window.addEventListener('keyup', keyHandler);

    return () => window.removeEventListener('keyup', keyHandler);
  }, []);
};