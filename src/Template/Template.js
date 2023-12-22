import AbstractTemplate from "./AbstractTemplate";


/**
 *
 * @param {string} $template
 * @param {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} $viewProps
 * @param {boolean} $isWithTry
 * @param {boolean} $catchValue
 *
 * @class
 * @extends AbstractTemplate
 */
const Template = function($template, $viewProps, $isWithTry = false, $catchValue = false) {

    AbstractTemplate.apply(this, [$viewProps]);

    $template = $template.trim().replace(/^\{\{|\}\}$/g, '').trim();

    const RANGE_TEMPLATE_REGEX = /^([a-z0-9.$_]+)\.\.([a-z0-9.$_]+)$/i;

    /** @type {Function[]} */
    const $listeners = [];

    /** @type {State} */
    let $componentState = $viewProps.componentInstance.getState();

    if(RANGE_TEMPLATE_REGEX.test($template)) {
        const matches = $template.match(RANGE_TEMPLATE_REGEX);
        matches.shift();
        if(matches.length !== 2) {
            return;
        }
        const [min, max] = matches;
        $template = 'Array.from({ length: ' + max+ '}, function(value, index) { return index + ' + min + '; })';
    }

    /** @type {string[]} */
    const requestedVariablesNames = this.getRequestedVars($template);

    let $templateFunction = null;

    const trigger = () => {
        $listeners.forEach((listener) => {
            listener.apply(listener, [this.value()]);
        });
    };

    /**
     * @param {Function} listener
     *
     * @returns {Function}
     */
    this.onUpdate = function(listener) {
        $listeners.push(listener);
        return listener;
    };

    this.statesToWatch = function() {
        return requestedVariablesNames;
    };

    this.disconnect = function(listener) {
        const index = $listeners.indexOf(listener);
        if(index < 0) {
            return;
        }
        $listeners.splice(index, 1);
    };

    /**
     * @param {?Object.<string, *>} valuesToUse
     *
     * @returns {*}
     */
    this.value = function(valuesToUse) {
        // TODO : get the value evaluated by the template manager
        const states = {};
        for (const name of requestedVariablesNames) {
            if(valuesToUse && valuesToUse[name] !== undefined) {
                states[name] = valuesToUse[name];
                continue;
            }
            const state = $viewProps.getState(name, $template);
            if(state) {
                states[name] = state.value();
            }
        }
        return $templateFunction(states);
    };

    (function () { /* Constructor */
        try {
            let returnCode = 'return '+ $template +';';

            if($isWithTry) {
                returnCode = ' try { '+ returnCode +' } catch(e) { return '+ $catchValue +'; }';
            }

            $templateFunction = new Function(
                'states',
                (requestedVariablesNames.length ? 'const {'+ requestedVariablesNames.join(',') +'} = states;' : '') +
                returnCode
            );
        } catch (e) {
            throw new Error('Syntax error : '+ $template);
        }

        if(!requestedVariablesNames.length) {
            return;
        }

        if($viewProps.localState) {
            $viewProps.localState.onUpdate(requestedVariablesNames, trigger);
            return;
        }

        $componentState.onUpdate(requestedVariablesNames, trigger);
    }());
};

export default Template;