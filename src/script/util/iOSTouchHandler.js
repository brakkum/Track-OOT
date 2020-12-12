/**
 * Thinking different does not always work better...
 */

const isIOS = (/iPad|iPhone|iPod/.test(navigator.platform) ||
(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
!window.MSStream;

const ACTIVE_EVENTS = new WeakMap();

function handleTouchStart(event) {
    const target = event.currentTarget;
    if (!ACTIVE_EVENTS.has(target)) {
        const touch = event.changedTouches[0];
        ACTIVE_EVENTS.set(target, setTimeout(() => {
            ACTIVE_EVENTS.delete(target);
            if (window.navigator?.vibrate != null) {
                window.navigator.vibrate(100);
            }
            const nEvent = new Event("contextmenu");
            nEvent.clientX = touch.clientX;
            nEvent.clientY = touch.clientY;
            target.dispatchEvent(nEvent);
        }, 500));
    }
    event.preventDefault();
    return false;
}

function handleTouchCancle(event) {
    const target = event.currentTarget;
    if (ACTIVE_EVENTS.has(target)) {
        const timer = ACTIVE_EVENTS.get(target);
        ACTIVE_EVENTS.delete(target);
        clearInterval(timer);
    }
    event.preventDefault();
    return false;
}

function handleTouchEnd(event) {
    const target = event.currentTarget;
    if (ACTIVE_EVENTS.has(target)) {
        const touch = event.changedTouches[0];
        const timer = ACTIVE_EVENTS.get(target);
        ACTIVE_EVENTS.delete(target);
        clearInterval(timer);
        const nEvent = new Event("click");
        nEvent.clientX = touch.clientX;
        nEvent.clientY = touch.clientY;
        target.dispatchEvent(nEvent);
    }
    event.preventDefault();
    return false;
}

class TouchHandler {

    register(element) {
        if (!(element instanceof HTMLElement)) {
            throw new TypeError("element must be of type HTMLElement");
        }
        if (isIOS) {
            element.addEventListener("touchstart", handleTouchStart);
            element.addEventListener("touchcancle", handleTouchCancle);
            element.addEventListener("touchend", handleTouchEnd);
        }
    }

}

export default new TouchHandler();
