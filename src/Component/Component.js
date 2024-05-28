import State from "src/State/State";
import HbEvent from "src/Event/HbEvent";
import Lifecycle from "src/Component/Lifecycle";
import LifecycleHandler from "src/Component/LifecycleHandler";

/**
 *
 * @param {string} $name Description - Component name
 * @param {View} $view
 * @param {Function} $controller
 * @param {ComponentProps} $props
 * @param {App} $appInstance
 *
 * @class
 */
const Component = function($name, $view, $controller, $props, $appInstance) {

    /** @type {Object.<string, Function>} */
    const $actions = {};

    const $event = new HbEvent();

    const $state = new State();

    const $lifecycleListeners = Lifecycle.newListenersStore();

    const $lifecycle = new Lifecycle($lifecycleListeners);

    const $lifecycleHandler = new LifecycleHandler($lifecycleListeners);

    /** @type {Object.<string, ViewHtmlElement|ViewComponentElement>} */
    const $refs = $view.getReferences();

    /* Allow current component to use the application state */
    $state.parent = $appInstance.getState();
    $state.App = $appInstance.getState();

    const $componentRequirements = { App: $appInstance, Actions: $actions, HbEvent: $event, State: $state, Props: $props,  Lifecycle: $lifecycle, Ref: $refs };

    const $publicFunctions = $controller($componentRequirements);

    /**
     * @param {HTMLElement|DocumentFragment} parentNode
     */
    this.render = function(parentNode) {
        $lifecycleHandler.beforeCreate();
        $view.render(parentNode);
        $lifecycleHandler.created();
    };

    this.isRendered = function() {
        return $view.isRendered();
    };

    /**
     * @param {boolean} full
     */
    this.unmount = function(full) {
        $lifecycleHandler.beforeUnmount();
        $view.unmount(full);
        $lifecycleHandler.unmounted();
    };

    this.mount = function() {
        $lifecycleHandler.beforeMount();
        $view.mount();
        $lifecycleHandler.mounted();
    };

    this.remove = function() {
        // TODO : improve the remove
        $lifecycleHandler.beforeRemove();
        $view.remove();
        $state.disconnect();
        $event.disconnect();
        $lifecycleHandler.removed();
    };

    /**
     * @param {string} name
     *
     * @returns {StateItem}
     */
    this.getStateByName = function(name) {
        return $state.get(name);
    };

    /**
     * @returns {State}
     */
    this.getState = function() {
        return $state;
    };

    /**
     * @returns {string}
     */
    this.getName = function() {
        return $name;
    };

    /**
     * @returns {Object.<string, Function>}
     */
    this.getActions = function() {
        return $actions;
    };

    /**
     * @returns {HbEvent}
     */
    this.getHbEvent = function() {
        return $event;
    };

    /**
     * @param {string} name
     *
     * @returns {?Function}
     */
    this.getSlot = function(name) {
        return $props.getSlot(name);
    };

    /**
     * @returns {Object.<string, Function>}
     */
    this.getPublicMethod = function() {
        return !$publicFunctions ? {} : { ...$publicFunctions };
    };

    /**
     * @param {Function} controller
     */
    this.updateController = function(controller) {
        const stateValues = $state.getAll();
        $lifecycle.clearAll();
        $event.clearAll();
        controller($componentRequirements);
        for(const oldStateName in stateValues) {
            if($state.exists(oldStateName)) {
                const value = $state.get(oldStateName).value();
                const oldValue = stateValues[oldStateName];
                if(typeof value !== typeof oldValue) {
                    continue;
                }
                if(Array.isArray(oldValue)) {
                    continue;
                }
                $state.set({ [oldStateName]: stateValues[oldStateName] });
            }
        }
    };

    ((() => { /* constructor */
        for(const actionName in $actions) {
            $actions[actionName] = $actions[actionName].bind($actions);
        }

        $view.setComponentInstance(this);
    })());
};

export default Component;