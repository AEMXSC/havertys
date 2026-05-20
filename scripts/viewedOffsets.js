const documentScrollTop = () => document.body.scrollTop || document.documentElement.scrollTop;
const documentScrollLeft = () => document.body.scrollLeft || document.documentElement.scrollLeft;

export default function viewedOffsets() {
  const minXOffset = { current: 0 };
  const maxXOffset = { current: 0 };
  const minYOffset = { current: 0 };
  const maxYOffset = { current: 0 };

  const onResizeOrScroll = () => {
    const currentXOffset = documentScrollLeft();
    const currentYOffset = documentScrollTop();
    minXOffset.current = Math.min(currentXOffset, minXOffset.current);
    maxXOffset.current = Math.max(currentXOffset + window.innerWidth, maxXOffset.current);
    minYOffset.current = Math.min(currentYOffset, minYOffset.current);
    maxYOffset.current = Math.max(currentYOffset + window.innerHeight, maxYOffset.current);
  };

  // Automatically initialize offsets and add event listeners when viewedOffsets is called
  const initOffsets = () => {
    const currentXOffset = documentScrollLeft();
    const currentYOffset = documentScrollTop();
    minXOffset.current = currentXOffset;
    maxXOffset.current = currentXOffset + window.innerWidth;
    minYOffset.current = currentYOffset;
    maxYOffset.current = currentYOffset + window.innerHeight;

    window.addEventListener('scroll', onResizeOrScroll);
    window.addEventListener('resize', onResizeOrScroll);
  };

  const cleanupOffsets = () => {
    window.removeEventListener('scroll', onResizeOrScroll);
    window.removeEventListener('resize', onResizeOrScroll);
  };

  // Call the initialization automatically
  initOffsets();

  // Return the offsets and the cleanup function
  return {
    minXOffset,
    maxXOffset,
    minYOffset,
    maxYOffset,
    cleanupOffsets,
  };
}
