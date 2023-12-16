import View from "src/Views/View";
import xmlEngine from "../Engines/xmlEngine";

/**
 *
 * @param {string|Array|Object} $viewDescription
 * @param {App} $appInstance
 * @param {{ engines: string[], disableXmlEngine: boolean }} $options
 *
 * @class
 */
const ViewFactory =  function($viewDescription, $appInstance, $options) {
    let $view = $viewDescription;

    this.create = function() {
        return new View($view, $appInstance);
    };

    ((function() { // constructor

        if($options && $options.engines) {
            const engines = (typeof $options.engines === 'string') ? [$options.engines] : $options.engines;

            engines.forEach((engineName) => {
                const engine = window.Habame.getViewEngine(engineName);
                $view = engine($view);
            });
        }

        if($options.disableXmlEngine === true) {
            return;
        }

        if(typeof $view === 'string') {
            $view = xmlEngine($view);
        }
    })());
};

export default ViewFactory;