// SpinWheel.js

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { playWheelSnap } from '../utils/feedback';
import './SpinWheel.css';

const STATES = ['DOGE', 'ELON', 'PEPE'];
const SNAP_POINTS = 36;
const SPIN_DURATION_MIN = 2000;
const SPIN_DURATION_MAX = 3000;

const SpinWheel = ({ 
  onChoiceSelect, 
  currentRoundStatus, 
  playerChoice, 
  canInitiateSpin = true 
}) => {
  const [displayRotation, setDisplayRotation] = useState(0);
  const [currentState, setCurrentState] = useState('ELON');
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const wheelRef = useRef(null);
  const dragZoneRef = useRef(null);
  const isDragging = useRef(false);
  const startAngle = useRef(0);
  const totalRotation = useRef(0);
  const initialSpinCompleted = useRef(false);
  const lastSnappedRotation = useRef(0);

  const isWheelDisabled = currentRoundStatus === 'Active' && playerChoice !== null;

  const getAngle = useCallback((clientX, clientY) => {
    const rect = dragZoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  }, []);

  useEffect(() => {
    const imagesToLoad = [
      ...STATES.map(state => `/images/${state.toLowerCase()}-base.png`),
      ...STATES.map(state => `/images/${state.toLowerCase()}-static.png`),
      '/images/wheel.png'
    ];

    let loadedCount = 0;
    imagesToLoad.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imagesToLoad.length) {
          setImagesLoaded(true);
        }
      };
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (imagesLoaded && !initialSpinCompleted.current && canInitiateSpin) {
      setTimeout(() => {
        if (playerChoice) {
          const rotation = getRotationForChoice(playerChoice);
          setDisplayRotation(rotation);
          totalRotation.current = rotation;
          updateCurrentState(rotation);
        } else {
          startRandomSpin();
        }
        initialSpinCompleted.current = true;
      }, 100);
    }
  }, [imagesLoaded, playerChoice, canInitiateSpin]);

  const updateCurrentState = useCallback((rotation) => {
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    let newState;
    if (normalizedRotation >= 240 && normalizedRotation < 360) {
      newState = 'ELON';
    } else if (normalizedRotation >= 120 && normalizedRotation < 240) {
      newState = 'PEPE';
    } else {
      newState = 'DOGE';
    }
    setCurrentState(newState);
    onChoiceSelect(newState);
  }, [onChoiceSelect]);

  const snapRotation = useCallback((rotation) => {
    const snapAngle = 360 / SNAP_POINTS;
    const snappedRotation = Math.round(rotation / snapAngle) * snapAngle;
    if (snappedRotation !== lastSnappedRotation.current) {
      playWheelSnap();
      lastSnappedRotation.current = snappedRotation;
    }
    return snappedRotation;
  }, []);

  const handleDragStart = useCallback((clientX, clientY) => {
    if (isSpinning || isWheelDisabled) return;
    
    const rect = dragZoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
    
    if (distance < rect.width * 0.1) {
      startRandomSpin();
    } else {
      isDragging.current = true;
      startAngle.current = getAngle(clientX, clientY);
    }
  }, [getAngle, isSpinning, isWheelDisabled]);

  const startRandomSpin = () => {
    if (isSpinning || isWheelDisabled) return;
    setIsSpinning(true);
    const targetRotation = totalRotation.current + 1080 + Math.random() * 720;
    const spinDuration = SPIN_DURATION_MIN + Math.random() * (SPIN_DURATION_MAX - SPIN_DURATION_MIN);
    const startTime = Date.now();

    const animateSpin = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;

      if (elapsedTime < spinDuration) {
        const progress = elapsedTime / spinDuration;
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentRotation = totalRotation.current + (targetRotation - totalRotation.current) * easedProgress;
        
        const snappedRotation = snapRotation(currentRotation);
        setDisplayRotation(currentRotation);
        updateCurrentState(currentRotation);
        requestAnimationFrame(animateSpin);
      } else {
        totalRotation.current = targetRotation;
        setDisplayRotation(targetRotation);
        updateCurrentState(targetRotation);
        setIsSpinning(false);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  const handleDrag = useCallback((clientX, clientY) => {
    if (!isDragging.current || isSpinning || isWheelDisabled) return;
    
    const currentAngle = getAngle(clientX, clientY);
    let deltaAngle = currentAngle - startAngle.current;
    
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    
    totalRotation.current += deltaAngle;
    const snappedRotation = snapRotation(totalRotation.current);
    
    setDisplayRotation(snappedRotation);
    updateCurrentState(snappedRotation);
    
    startAngle.current = currentAngle;
  }, [getAngle, isSpinning, snapRotation, updateCurrentState, isWheelDisabled]);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((clientX, clientY) => {
    const rect = dragZoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
    
    setIsHovering(distance < rect.width * 0.1);

    if (isDragging.current && !isSpinning && !isWheelDisabled) {
      handleDrag(clientX, clientY);
    }
  }, [handleDrag, isSpinning, isWheelDisabled]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsTouching(true);
    handleDragStart(touch.clientX, touch.clientY);
  }, [handleDragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
    handleDragEnd();
  }, [handleDragEnd]);

  useEffect(() => {
    const handleMouseMoveEvent = (e) => handleMouseMove(e.clientX, e.clientY);
    const handleTouchMoveEvent = (e) => {
      e.preventDefault();
      handleMouseMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    document.addEventListener('mousemove', handleMouseMoveEvent);
    document.addEventListener('touchmove', handleTouchMoveEvent, { passive: false });
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveEvent);
      document.removeEventListener('touchmove', handleTouchMoveEvent);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleMouseMove, handleDragEnd]);

  const getRotationForChoice = (choice) => {
    switch (choice) {
      case 'ELON':
        return 300; // Middle of ELON range (240-360)
      case 'PEPE':
        return 180; // Middle of PEPE range (120-240)
      case 'DOGE':
        return 60;  // Middle of DOGE range (0-120)
      default:
        return 0;
    }
  };

  return (
    <div 
      className={`spin-wheel-container ${isSpinning ? 'spinning' : ''} ${isHovering ? 'hovering' : ''} ${isTouching ? 'touching' : ''} ${isWheelDisabled ? 'disabled' : ''}`}
      style={{ opacity: imagesLoaded ? 1 : 0 }}
      ref={wheelRef}
    >
      {STATES.map((state) => (
        <img 
          key={`${state}-base`}
          src={`/images/${state.toLowerCase()}-base.png`}
          alt={`${state} base`}
          className={`base-image noselect ${currentState === state ? 'active' : ''}`}
          draggable="false"
        />
      ))}
      {STATES.map((state) => (
        <img 
          key={`${state}-static`}
          src={`/images/${state.toLowerCase()}-static.png`}
          alt={state}
          className={`static-image noselect ${currentState === state ? 'active' : ''}`}
          draggable="false"
        />
      ))}
      <img 
        src="/images/wheel.png"
        alt="Wheel"
        className="wheel-image noselect"
        draggable="false"
        style={{ transform: `rotate(${displayRotation}deg)` }}
      />
      <div 
        className="drag-zone nodrag"
        ref={dragZoneRef}
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      ></div>
    </div>
  );
};

export default SpinWheel;