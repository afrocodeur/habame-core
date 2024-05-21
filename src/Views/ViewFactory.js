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

    const applyViewEngines = (view) => {
        if($options && $options.engines) {
            const engines = (typeof $options.engines === 'string') ? [$options.engines] : $options.engines;

            engines.forEach((engineName) => {
                const engine = window.Habame.getViewEngine(engineName);
                view = engine(view);
            });
        }

        if($options.disableXmlEngine === true) {
            return view;
        }

        if(typeof view === 'string') {
            view = xmlEngine(view);
        }
        return view;
    };

    this.create = function() {
        return new View($view, $appInstance);
    };

    this.updateViewDescription = function(viewDescription) {
        $view = applyViewEngines(viewDescription);
        return $view;
    };

    ((function() { // constructor
        $view = applyViewEngines($viewDescription);
    })());
};

export default ViewFactory;