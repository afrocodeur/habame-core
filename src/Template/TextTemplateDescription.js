import Template from "src/Template/Template";

/**
 *
 * @param {string} $template
 * @param {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} $viewProps
 *
 * @class
 */
const TextTemplateDescription = function($template, $viewProps) {

    const $parts = $template
        .split(/(\{\{.+?\}\})/)
        .map((value) => {
            const hasAState = /(^\{\{.+?\}\}$)/.test(value);
            return {
                value: value,
                hasAState,
                template: (hasAState ? new Template(value, $viewProps): null)
            };
        });

    /** @type {string[]} */
    const $statesToWatch = $parts.reduce(function(statesToWatch, currentValue) {
        if(!currentValue.hasAState) {
            return statesToWatch;
        }
        const stateList = currentValue.template.statesToWatch();
        stateList.forEach((stateName) => {
           if(!statesToWatch.includes(stateName)) {
               statesToWatch.push(stateName);
           }
        });
        return statesToWatch;
    }, []);

    const $stateless = !$parts.some((part) => part.hasAState);

    this.isStateLess = function() {
        return $stateless;
    };

    /**
     * @param {Function} callback
     */
    this.each = function(callback) {
        $parts.forEach((part) => {
            callback.apply(callback, [part]);
        });
    };

    this.statesToWatch = function() {
        return $statesToWatch;
    };

};

export default TextTemplateDescription;