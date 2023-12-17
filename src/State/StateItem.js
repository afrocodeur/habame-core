import stateItemMutatorOverride from "src/State/stateItemMutatorOverride";

/**
 *
 * @param {*}$defaultValue
 * @param {State} $parentState
 *
 * @class
 */
const StateItem = function($defaultValue, $parentState) {

    stateItemMutatorOverride($defaultValue, this);

    const $stateValue = {
        default: $defaultValue,
        current: $defaultValue,
        last: $defaultValue
    };

    /** @type {Function[]} */
    const $listeners = [];

    const triggerListener = () => {
        if($parentState && $parentState.isSwitchOff()) {
            return;
        }
        $listeners.forEach((listener) => {
            listener.apply(listener, [$stateValue.current, $stateValue.last])
        });
    };

    /**
     * @param {*} value
     * @param {boolean} shouldTriggerListeners
     *
     * @returns {boolean}
     */
    this.set = function(value, shouldTriggerListeners = true) {
        if(value === $stateValue.current) {
            return false;
        }
        $stateValue.last = $stateValue.current;
        stateItemMutatorOverride(value);
        $stateValue.current = value;
        if(shouldTriggerListeners) {
            triggerListener();
        }
        return true;
    };

    this.value = function() {
        return $stateValue.current;
    };

    this.getLastValue = function() {
        return $stateValue.last;
    };

    this.getInitialValue = function() {
        return $stateValue.default;
    };

    /**
     * @param {Function} listener
     *
     * @returns {Function}
     */
    this.onUpdate = function(listener) {
        // Todo: thinks about options to allow once
        $listeners.push(listener);
        return listener;
    };

    this.watch = this.onUpdate;

    this.trigger = function() {
        triggerListener();
    };

    /**
     * @param {Function} listener
     */
    this.disconnect = function(listener) {
        const index = $listeners.indexOf(listener);
        if(index < 0) {
            return;
        }
        $listeners.splice(index, 1);
    };

    this.reset = function() {
        this.set($stateValue.default);
    };
};

export default StateItem;