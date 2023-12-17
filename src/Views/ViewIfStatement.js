import Template from "src/Template/Template";

/**
 *
 * @param {string} $ifStatement
 * @param {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} $viewProps
 *
 *  @class
 */
const ViewIfStatement = function($ifStatement, $viewProps) {

    const $ifTemplate = new Template($ifStatement, $viewProps, true);

    /** @type {Function[]} */
    const $listeners = [];

    const trigger = function() {
        $listeners.forEach((callback) => {
            callback.apply(callback, [!!$ifTemplate.value()]);
        });
    };

    /**
     * @param {Function} callback
     * @returns {Function}
     */
    this.watch = function(callback) {
        $listeners.push(callback);
        return callback;
    };

    this.isTrue = function() {
        return !!$ifTemplate.value() === true;
    };

    this.isFalse = function() {
        return !!$ifTemplate.value() === false;
    };


    ((() => { /* Constructor */
        $viewProps.componentInstance.getState().onUpdate($ifTemplate.statesToWatch(), trigger, true);
    })());

};

export default ViewIfStatement;