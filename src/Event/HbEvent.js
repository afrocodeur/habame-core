/**
 *
 * @class
 */
const HbEvent = function () {

    const $this = this;

    /** @type {Object.<string, Function[]>} */
    const $listeners = {};

    /**
     * @param {string} name
     * @param {?Array} params
     */
    this.emit = function(name, params) {
        if(!$listeners[name]) {
            return;
        }
        $listeners[name].forEach((listener) => {
            params = params || [];
            listener.apply(listener, params);
        });
    };

    /**
     * @param {string} name
     *
     * @returns {?{emit: Function}}
     */
    this.create = function(name) {
        const eventBridge = {
            emit: function() {
                $this.emit(name, Array.from(arguments));
            }
        };
        if(this[name] !== undefined) {
            return null;
        }
        Object.defineProperty(this, name, {
            get() {
                return eventBridge;
            }
        });

        return eventBridge;
    };

    this.disconnect = function() {
        for(const key in $listeners) {
            $listeners[key].splice(0);
        }
    };

    /**
     *
     * @param {string} name
     * @param {Function} listener
     *
     * @returns {?Function}
     */
    this.addEventListener = function(name, listener) {
        if(typeof listener !== 'function') {
            return null;
        }
        $listeners[name] = $listeners[name] || [];
        $listeners[name].push(listener);
        return listener;
    };

    /**
     * @param {string} name
     * @param {Function} listenerToRemove
     */
    this.removeEventListener = function(name, listenerToRemove) {
        if($listeners[name] === undefined) {
            return;
        }
        const listeners = $listeners[name];
        const listenerIndex = listeners.indexOf(listenerToRemove);
        if(listenerIndex < 0) {
            return;
        }
        listeners.splice(listenerIndex, 1);
    };

};

export default HbEvent;