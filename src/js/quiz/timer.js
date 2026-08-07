/**
 * Cronômetro de tempo decorrido (opcional e independente da UI).
 * Ex.: timer.onTick = (seconds) => atualizarLabel(seconds);
 */
export function createTimer(onTick = null) {
  let elapsed = 0;
  let intervalId = null;

  const timer = {
    onTick,

    start() {
      if (intervalId !== null) return;
      intervalId = setInterval(() => {
        elapsed += 1;
        if (typeof this.onTick === 'function') this.onTick(elapsed);
      }, 1000);
    },

    stop() {
      clearInterval(intervalId);
      intervalId = null;
    },

    reset() {
      this.stop();
      elapsed = 0;
    },

    get elapsed() {
      return elapsed;
    }
  };

  return timer;
}