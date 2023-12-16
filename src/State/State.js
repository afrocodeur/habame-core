import StateItem from "src/State/StateItem";
import ComponentProps from "src/Component/ComponentProps";

/**
 *
 * @param {?Object.<string, *>} $defaultValues
 *
 * @class
 */
const State = function($defaultValues = {}) {

    /** @type {Object.<string, StateItem>} */
    const $stateItems = {};

    /**
     *  @type {string} $listeners[].names - list of state name
     *  @type {Function} $listeners[].listener - the function to handle if one of names match
     *  @type {Object[]} $listeners
     *
     *  */
    const $listeners = [];
    const $triggerListenersOptions = {
        enable: true,
        listenersToHandle: new Set()
    };

    let $lock = false;

    /**
     * @param {string[]} stateNames
     */
    const triggerStateItems = (stateNames) => {
        if(!$triggerListenersOptions.enable) {
            return;
        }

        $listeners.forEach(({ names, listener }) => {
            if(!names) {
                return;
            }
            const shouldTriggerListener = names.some((name) => stateNames.includes(name));
            if(!shouldTriggerListener) {
                return;
            }
            listener.apply(listener, []);
        });
    };

    /**
     * @param {string} stateName
     * @param {*} stateValue
     * @returns {StateItem}
     */
    this.add = function(stateName, stateValue) {
        if($lock) {
            // TODO
            // console.warn("It's not recommended to add a state after initialisation");
        }
        const stateItem = new StateItem(stateValue, this);

        // If this state change, let's inform all concerned listeners
        stateItem.onUpdate(() => triggerStateItems([stateName]));
        $stateItems[stateName] = stateItem;

        if(typeof this[stateName] === 'function') {
            return stateItem;
        }

        Object.defineProperty(this, stateName, {
            get () {
                return stateItem.value();
            },
            set(newValue) {
                stateItem.set(newValue);
            }
        });

        return stateItem;
    };

    this.switchOff = function() {
        $triggerListenersOptions.enable = false;
    };

    this.isSwitchOff = function() {
       return $triggerListenersOptions.enable === false;
    };

    this.switchOn = function() {
        $triggerListenersOptions.enable = true;
        const updaters = [...$triggerListenersOptions.listenersToHandle];
        $triggerListenersOptions.listenersToHandle.clear(); // Avoid recursive update
        updaters.forEach(({ state, variables }) => state.trigger(variables) );
    };

    /**
     * Add multiple state
     * s
     * @param {Object.<string, *>} values
     */
    this.init = function(values) {
        for(const key in values) {
            this.add(key, values[key]);
        }
    };

    /**
     * Connect the component state to its props
     *
     * @param {ComponentProps} props
     */
    this.useProps = function(props) {
        if(!(props instanceof ComponentProps)) {
            throw new Error('State.useProps require a ComponentProps instance');
        }
        const propsValues = props.all();
        for (const propName in propsValues) {
            const stateItem = this.add(propName, propsValues[propName]);
            props.onUpdate(propName, (value) => stateItem.set(value));
        }
    };

    this.useService = function(serviceInstance, only = []) {
        const serviceState = serviceInstance.$serviceState;
        if(!serviceState || !(serviceState instanceof State)) {
            throw new Error('Invalid service provide to useService');
        }
        const stateNames = serviceState.getStateNames();
        for(const stateName of stateNames) {
            if(only && only.length && !only.includes(stateName)) {
                continue;
            }
            const sourceState = serviceState.get(stateName);
            const stateItem = this.add(stateName, sourceState.value());
            sourceState.onUpdate((value) => stateItem.set(value));
        }
    };

    /**
     * Update multiple state at the same for more performance
     * @param {Object.<string, *>} values
     */
    this.set = function(values) {
        let shouldTrigger = false;
        for (const stateName in values) {
            if($stateItems[stateName] === undefined) {
                throw new Error('Undefined State: ' + stateName + ' is not declared as state');
            }
            const isUpdated = $stateItems[stateName].set(values[stateName], false);
            if(isUpdated) {
                shouldTrigger = true;
            }
        }
        if(!shouldTrigger) {
            return;
        }
        triggerStateItems(Object.keys(values));
    };

    /**
     *
     * @param {string[]} names
     */
    this.trigger = function(names) {
        triggerStateItems(names);
    };

    /**
     * @param {string} name
     */
    this.exists = function(name) {
        return $stateItems[name] !== undefined;
    };

    /**
     * get State which has a state with the name
     *
     * @param {string} name
     * @returns {?State}
     */
    this.getStateWith = function(name) {
        if($stateItems[name] !== undefined) {
            return this;
        }
        return (this.parent) ? this.parent.getStateWith(name) : null;
    };

    /**
     * @param {string[]} names
     * @returns {}
     */
    this.getValues = function(names) {
        const values = {};
        names.forEach((name) => {
            const stateItem = this.get(name);
            values[name] = stateItem.value();
        });
        return values;
    };

    /**
     * @param {string} name
     * @returns {StateItem}
     */
    this.get = function(name) {
        if($stateItems[name] === undefined) {
            if(this.parent) {
                return this.parent.get(name);
            }
        }
        return $stateItems[name];
    };

    /**
     * @returns {string[]}
     */
    this.getStateNames = function() {
        return Object.keys($stateItems);
    };

    this.reset = function() {
        for(const state of $stateItems) {
            state.reset();
        }
    };

    /**
     *
     * @param {string[]} names
     * @param {Function} listener
     * @param {boolean} isToHandleFirst
     * @returns {Function}
     */
    this.onUpdate = function(names, listener, isToHandleFirst = false) {
        const notFoundStateNames = names.filter((name) => !this.exists(name));
        isToHandleFirst ? $listeners.unshift({ names, listener }) : $listeners.push({ names, listener });
        if(notFoundStateNames.length === 0) {
            return listener;
        }

        const dependedStates = [];
        notFoundStateNames.forEach((name) => {
            const dependedState = this.getStateWith(name);
            if(!dependedState) {
                return;
            }
            const item = dependedStates.find(({ state }) => (state === dependedState));
            if(!item) {
                dependedStates.push({ state: dependedState, variables: [name] });
                return;
            }
            item.variables.push(name);
        });

        if(dependedStates.length === 0) {
            return listener;
        }

        dependedStates.forEach(({ state, variables}) => {
            const updateDataOptions = { variables, state };
            state.onUpdate(variables, () => {
                if(!$triggerListenersOptions.enable) {
                    $triggerListenersOptions.listenersToHandle.add(updateDataOptions);
                    return;
                }
                listener.apply(listener, Array.from(arguments));
            });
        });

        return listener;
    };

    this.unlock = function() {
        $lock = false;
    };
    this.disconnect = function() {
        $listeners.splice(0);
        $triggerListenersOptions.listenersToHandle.clear();
    };

    this.lock =  function() {
        $lock = true;
    };

    ((() => { /* constructor */
        if(!$defaultValues) {
            return;
        }
        for(const key in $defaultValues) {
            this.add(key, $defaultValues[key]);
        }
    })());
};

export default State;