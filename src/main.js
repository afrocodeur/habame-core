import App from 'src/App/App';
import ComponentFactory from "src/Component/ComponentFactory";
import DirectiveFactory from "src/Directive/DirectiveFactory";
import ServiceWrapper from "src/Service/ServiceWrapper";

const Habame = (function(){

    /** @type {Object.<string, ComponentFactory>} */
    const $components = {};

    /** @type {Object.<string, DirectiveFactory>} */
    const $directives = {};

    /** @type {Object.<string, ServiceWrapper>} */
    const $services = {};

    let $viewEngines = {};
    let $defaultViewEngine = null;

    return {
        Services: {},
        /**
         * @param {HTMLElement} htmlNodeElement
         *
         * @returns {App}
         */
        createRoot: function(htmlNodeElement) {
            return new App(htmlNodeElement);
        },
        /**
         * @param {string} name
         * @param {Function} viewEngine
         */
        setDefaultViewEngine: function(name, viewEngine) {
            if(viewEngine) {
                this.addViewEngine(name, viewEngine);
            }
            $defaultViewEngine = name;
        },
        /**
         * @param {string} name
         * @param {Function} viewEngine
         */
        addViewEngine: function(name, viewEngine) {
            if($viewEngines[name] !== undefined ) {
                return;
            }

            if(typeof viewEngine !== 'function') {
                throw new Error('View Engine ' + name + ' must be a function');
            }

            $viewEngines[name] = viewEngine;
        },
        /**
         * @param {string} name
         *
         * @returns {?Function}
         */
        getViewEngine: function(name) {
            return $viewEngines[name];
        },
        /**
         * @param {string} name
         * @param {Function} controller
         * @param {string|Array|Object} view
         * @param {{ engines: string|string[], disableXmlEngine: boolean }} options
         *
         * @returns {ComponentFactory}
         */
        createComponent: function(name, controller, view, options = {}) {
            options.engines = options.engines || $defaultViewEngine;
            const $componentFactory = new ComponentFactory(name, controller, view, options);
            $components[name] = $componentFactory;
            return $componentFactory;
        },
        /**
         * @param {string} name
         * @param {Function} service
         * @param {{ isUniqueInstance?: boolean, params: *[] }} options
         */
        createService: function(name, service, options ){
            const serviceWrapper = new ServiceWrapper(service, options);
            $services[name] = serviceWrapper;
            Object.defineProperty(Habame.Services, name, {
                get() {
                    return serviceWrapper.create();
                }
            });
        },
        getServices: function() {
            return $services;
        },
        /**
         * @param {string} name
         *
         * @returns {ComponentFactory}
         */
        getComponentFactory: function(name) {
            const factory = $components[name];
            if(!factory) {
                throw new Error('Component ' + name + ' not found');
            }
            return factory;
        },
        /**
         * @param {string} name
         * @param {Function} directive
         *
         * @returns {DirectiveFactory}
         */
        createDirective: function(name, directive) {
            const $directiveFactory = new DirectiveFactory(name, directive);
            $directives[name] = $directiveFactory;
            return $directiveFactory;
        },
        /**
         * @param {string} name
         *
         * @returns {DirectiveFactory}
         */
        getDirectiveFactory: function(name) {
            const factory = $directives[name];
            if(!factory) {
                throw new Error('Directive ' + name + ' not found');
            }
            return factory;
        }
    };
}());

export default Habame;