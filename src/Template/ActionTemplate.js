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

    const $self =  this;

    AbstractTemplate.apply(this, [$viewProps]);

    /** @type {{states: string[], actions: string[]}} */
    let $requestedVariablesNames = {};
    const $stateToUse = $viewProps.localState ?? $viewProps.componentInstance.getState();
    const $actions = $viewProps.componentInstance.getActions();

    /** @type {?Function} */
    let $actionFunctionBridge = null;

    /** @type {?string} */
    let $lastTemplate = null;


    /**
     * @param {Event} event
     * @param {?*[]} args
     */
    this.handle =  function(event, args = null) {
        $actionFunctionBridge.apply($actions, [$stateToUse, $requestedVariablesNames.states, $actions, event, args]);
    };

    /**
     * @param {string} template
     */
    this.refresh = function(template) {
        if(template === $lastTemplate) {
            return;
        }
        $requestedVariablesNames = this.getRequestedVars(template, false);
        if($actions[template]) {
            template = template + '.apply(actions, (Array.isArray($args) ? $args : [$event]))';
        }

        try {
            let returnCode = 'return '+template+';';
            const { states, actions} = $requestedVariablesNames;

            $actionFunctionBridge = new Function(
                'state','states', 'actions', '$event', '$args',
                (states.length ? 'const {' + states.join(',') + '} = state.getValues(states);' : '') +
                (actions.length ? 'const {' + actions.join(',') + '} = actions;' : '') +
                returnCode
            );
            $lastTemplate = template;
        } catch (e) {
            throw new Error('Syntax error : ' + template);
        }
    };

    ((function() { // constructor
        $self.refresh($template);
    })());
};

export default ActionTemplate;