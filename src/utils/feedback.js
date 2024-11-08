// utils/feedback.js

// Sound configurations
export const CLICK_VOLUME_1 = 0.1;
export const CLICK_VOLUME_2 = 0.5;
export const HORN_VOLUME = 0.4;
export const MIN_CLICK_INTERVAL = 50;

// Vibration durations (in milliseconds)
export const WHEEL_SNAP_VIBRATION = 6;
export const BUTTON_CLICK_VIBRATION = 12;
export const CONFETTI_VIBRATION = 25;

// Initialize audio
const click1 = new Audio('/sounds/click1.mp3');
const click2 = new Audio('/sounds/click2.mp3');
const horn = new Audio('/sounds/horn1.mp3');

click1.volume = CLICK_VOLUME_1;
click2.volume = CLICK_VOLUME_2;
horn.volume = HORN_VOLUME;

let lastClickTime = 0;

const playVibration = (duration) => {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  } catch (error) {
    console.log('Vibration not supported or not allowed');
  }
};

export const playWheelSnap = () => {
  const now = Date.now();
  if (now - lastClickTime >= MIN_CLICK_INTERVAL) {
    try {
      click1.currentTime = 0;
      click1.play().catch(error => console.log('Audio playback prevented:', error));
    } catch (error) {
      console.log('Audio playback error:', error);
    }
    playVibration(WHEEL_SNAP_VIBRATION);
    lastClickTime = now;
  }
};

export const playClick2 = () => {
  const now = Date.now();
  if (now - lastClickTime >= MIN_CLICK_INTERVAL) {
    try {
      click2.currentTime = 0;
      click2.play().catch(error => console.log('Audio playback prevented:', error));
    } catch (error) {
      console.log('Audio playback error:', error);
    }
    // Double vibration with shorter duration
    playVibration([BUTTON_CLICK_VIBRATION, BUTTON_CLICK_VIBRATION]);
    lastClickTime = now;
  }
};

export const playHornSound = () => {
  try {
    horn.currentTime = 0;
    horn.play().catch(error => console.log('Audio playback prevented:', error));
  } catch (error) {
    console.log('Audio playback error:', error);
  }
  playVibration(CONFETTI_VIBRATION);
};