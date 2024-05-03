import ViewFactory from "src/Views/ViewFactory";
import Component from 'src/Component/Component';
import view from "../Views/View";

/**
 *
 * @param {string} $name
 * @param {Function} $controller
 * @param {string|Array|Object} $viewDescription
 * @param {{ engines: string[], disableXmlEngine: boolean }} $options
 *
 * @class
 */
const ComponentFactory = function($name, $controller, $viewDescription, $options) {

    /** @type {Component[]} */
    const $instances = [];

    const $sources = {
        view: $viewDescription,
        controller: $controller,
        options: $options
    };

    /** @type {?ViewFactory} */
    let $viewFactory = null;

    /**
     * @param {App} appInstance
     *
     * @returns {View}
     */
    const getNewView = function(appInstance) {
        if($viewFactory === null) {
            $viewFactory = new ViewFactory($sources.view, appInstance, $options);
        }

        return $viewFactory.create();
    };

    /**
     * @param {ComponentProps} props
     * @param {App} appInstance
     *
     * @returns {Component}
     */
    this.create = function(props, appInstance) {
        const view = getNewView(appInstance);
        const componentInstance = new Component($name, view, $sources.controller, props, appInstance);
        $instances.push(componentInstance);
        return componentInstance;
    };

    /**
     * @param {Function} controller
     */
    this.updateController = function(controller) {
        $sources.controller = controller;
        $instances.forEach((instance) => {
            instance.updateController(controller);
        });
    };

    /**
     * @param {string|Array|Object} viewDescription
     */
    this.updateView = function(viewDescription) {
        $sources.view = viewDescription;
    };

    /**
     * @param {string|Array|Object} view
     * @param {Function} controller
     */
    this.updateControllerAndView = function(view, controller) {
        this.updateController(controller);
        this.updateView(view);
    };

};

export default ComponentFactory;