import AbstractView from "src/Views/AbstractView";
import Template from "src/Template/Template";
import ComponentProps from "src/Component/ComponentProps";
import ActionTemplate from "../Template/ActionTemplate";

/**
 *
 * @param {Array|Object} $viewDescription
 * @param {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} $viewProps
 *
 * @class
 * @extends AbstractView
 */
const ViewComponentElement = function($viewDescription, $viewProps) {

    AbstractView.call(this, { $viewDescription, $viewProps });

    const $viewAnchor = document.createComment('');

    /** @type {?Component} */
    let $componentElement = null;

    /** @type {?ComponentProps} */
    let $componentProps = null;

    const build = function() {
        const props = {};
        if($viewDescription.props) {
            for(const propName in $viewDescription.props) {
                props[propName] = new Template($viewDescription.props[propName], $viewProps);
            }
        }
        $componentProps = new ComponentProps(props);

        $componentElement = $viewProps.appInstance.createComponentByName($viewDescription.component, $componentProps);
        buildEventListenerWithParent();
    };

    const buildEventListenerWithParent = () => {
        const componentActions = $viewProps.componentInstance.getActions();
        if(!$viewDescription.events || !componentActions) {
            return;
        }
        const hbEvent = $componentElement.getHbEvent();

        for(const eventName in $viewDescription.events) {
            const actionName = $viewDescription.events[eventName];
            const actionTemplate = new ActionTemplate(actionName, $viewProps);
            hbEvent.addEventListener(eventName, function() {
                const params = Array.from(arguments);
                params.push($viewProps.localState);
                actionTemplate.handle(null, params);
            });
        }
    };

    /**
     * @param {HTMLElement|DocumentFragment} parentNode
     * @param {ViewIfStatement} ifStatement
     */
    this.renderProcess = function(parentNode, ifStatement) {
        build();
        parentNode.appendChild($viewAnchor);
        if(ifStatement && ifStatement.isFalse()) {
            return;
        }
        $componentElement.render(parentNode);
    };

    this.unmountProcess = function() {
        $componentElement.unmount();
        this.setIsUnmounted();
    };

    /**
     * @param {ViewIfStatement} ifStatement
     */
    this.mountProcess = function(ifStatement) {
        if(ifStatement && ifStatement.isFalse()) {
            return;
        }
        if($componentElement.isRendered()) {
            $componentElement.mount();
        }
        else {
            const fragment = document.createDocumentFragment();
            $componentElement.render(fragment);
            this.insertAfter(fragment, $viewAnchor);
        }
        this.setIsMounted();
    };

    this.removeProcess = function() {
        $viewAnchor.remove();
        $componentElement.remove();
        this.setIsUnmounted();
    };

    this.target = function() {
        if(!$componentElement) {
            return null;
        }
        return $componentElement.getPublicMethod();
    };

};

export default ViewComponentElement;