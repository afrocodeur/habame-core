import ViewFactory from "src/Views/ViewFactory";
import Component from 'src/Component/Component';

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

    /** @type {?ViewFactory} */
    let $viewFactory = null;

    /**
     * @param {App} appInstance
     * @returns {View}
     */
    const getNewView = function(appInstance) {
        if($viewFactory === null) {
            $viewFactory = new ViewFactory($viewDescription, appInstance, $options);
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
        const componentInstance = new Component($name, view, $controller, props, appInstance);
        $instances.push(componentInstance);
        return componentInstance;
    };

};

export default ComponentFactory;