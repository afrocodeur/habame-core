import AbstractTemplate from "./AbstractTemplate";

/**
 *
 * @param {string} $template
 * @param {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} $viewProps
 *
 * @class
 * @extends AbstractTemplate
 */
const ActionTemplate = function($template, $viewProps) {

    AbstractTemplate.apply(this, [$viewProps]);

    /** @type {{states: string[], actions: string[]}} */
    const $requestedVariablesNames = this.getRequestedVars($template, false);
    const $stateToUse = $viewProps.localState ?? $viewProps.componentInstance.getState();
    const $actions = $viewProps.componentInstance.getActions();

    let $actionFunctionBridge = null;


    /**
     * @param {Event} event
     * @param {?*[]} args
     */
    this.handle =  function(event, args = null) {
        $actionFunctionBridge.apply($actions, [$stateToUse, $requestedVariablesNames.states, $actions, event, args]);
    };

    ((function() { // constructor

        if($actions[$template]) {
            $template = $template + '.apply(actions, (Array.isArray($args) ? $args : [$event]))';
        }

        try {
            let returnCode = 'return '+$template+';';
            const { states, actions} = $requestedVariablesNames;

            $actionFunctionBridge = new Function(
                'state','states', 'actions', '$event', '$args',
                (states.length ? 'const {' + states.join(',') + '} = state.getValues(states);' : '') +
                (actions.length ? 'const {' + actions.join(',') + '} = actions;' : '') +
                returnCode
            );
        } catch (e) {
            throw new Error('Syntax error : ' + $template);
        }

    })());
};

export default ActionTemplate;