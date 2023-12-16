import HbEvent from "src/Event/HbEvent";
import State from "src/State/State";
import ComponentProps from "src/Component/ComponentProps";

/**
 * @param {HTMLElement} htmlNodeElement
 *
 * @class
 */
const App = function(htmlNodeElement) {

    const $event = new HbEvent();
    const $state = new State();

    /**
     * @param {ComponentFactory} componentFactory
     * @param {ComponentProps} props
     * @returns Component
     */
    const createComponentInstance = (componentFactory, props) => {
        return componentFactory.create(props, this);
    };

    /**
     * @param {string} name
     * @param {Array} params
     */
    this.createDirectiveInstance = function(name, params) {
        const directiveFactory = window.Habame.getDirectiveFactory(name);
        return directiveFactory.create(params);
    };

    /**
     * @param {string} name
     * @param {?ComponentProps} props
     * @returns Component
     */
    this.createComponentByName = function(name, props) {
        const componentFactory = window.Habame.getComponentFactory(name);
        props = props || new ComponentProps();
        return createComponentInstance(componentFactory, props);
    };

    this.getEvent = function() {
        return $event;
    };

    this.getState = function() {
        return $state;
    };

    /**
     * @param {ComponentFactory|string} componentFactory
     * @returns Component
     */
    this.render = function(componentFactory) {
        const instance = (typeof componentFactory === 'string')
            ? this.createComponentByName(componentFactory, null)
            :createComponentInstance(componentFactory, null);
        instance.render(htmlNodeElement);
        return instance;
    };
};
export default App;