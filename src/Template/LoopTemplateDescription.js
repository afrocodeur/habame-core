import LoopForInExpressionHandler from "src/Template/LoopForInExpressionHandler";
import LoopForAsExpressionHandler from "src/Template/LoopForAsExpressionHandler";
import Template from "./Template";



const LOOP_TEMPLATE_HANDLERS = [
    LoopForInExpressionHandler,
    LoopForAsExpressionHandler
];

/**
 *
 * @param {string} $loopExpression
 * @param {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} $viewProps
 *
 * @class
 */
const LoopTemplateDescription = function($loopExpression, $viewProps) {

    /** @type {?Template} */
    let $iterableTemplate = null;

    /** @type {?LoopTemplateDescription} */
    let $loopExpressionDescription = null;


    // Todo : get source data
    // Get the iteration values (key|index, value)

    /** @returns {*} */
    this.getIterable = function() {
        return $iterableTemplate.value();
    };

    this.expressionDescription = function() {
        return $loopExpressionDescription;
    };

    /**
     *
     * @param {Function} listener
     * @returns {Function}
     */
    this.onUpdate = function(listener) {
        $iterableTemplate.onUpdate(listener);
        return listener;
    };

    ((() => { /* Constructor */
        $loopExpression = $loopExpression.trim().replace(/[\s]+/, ' ');
        for (const LoopHandler of LOOP_TEMPLATE_HANDLERS) {
            const handler = new LoopHandler();
            if(handler.test($loopExpression)) {
                handler.setExpression($loopExpression);
                $loopExpressionDescription = handler;
                $iterableTemplate = new Template($loopExpressionDescription.getIterableFullName(), $viewProps);
                return;
            }
        }
        // Todo : Improve error
        throw new Error('Syntax Error : ' + $loopExpression);
    })());

};

export default LoopTemplateDescription;