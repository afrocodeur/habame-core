import ViewElementFragment from "src/Views/ViewElementFragment";
import ViewHtmlElementAttribute from "src/Views/ViewHtmlElementAttribute";
import AbstractView from "src/Views/AbstractView";
import Lifecycle from "src/Component/Lifecycle";
import LifecycleHandler from "src/Component/LifecycleHandler";
import Directive from "src/Directive/Directive";
import State from "src/State/State";
import ActionTemplate from "src/Template/ActionTemplate";
import { DEFAULT_SLOT_NAME, SLOT_RENDER_TAG_NAME, EVENT_DIRECTIVE } from "src/constantes";
/**
 *
 * @param {Array|Object} $viewDescription
 * @param {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} $viewProps
 *
 *
 * @class
 * @extends AbstractView
 */
const ViewHtmlElement = function($viewDescription, $viewProps) {
    if($viewDescription.if) {
        const localState = new State();
        localState.parent = $viewProps.localState || $viewProps.componentInstance.getState();
        localState.if = $viewDescription.if;
        $viewProps = { ...$viewProps, localState };
    }

    AbstractView.call(this, { $viewDescription, $viewProps });

    const $viewAnchor = document.createComment(($viewDescription.name || 'DocumentFragment') + ' Anchor ' + ($viewDescription.if ? ': If (' + $viewDescription.if + ')' : ''));

    /** @type {Object.<string, ViewHtmlElementAttribute>} */
    const $htmlAttributes = {};

    const $lifecycleListeners = Lifecycle.newListenersStore();

    const $lifeCycleHandler = new LifecycleHandler($lifecycleListeners);

    /** @type {HTMLElement|DocumentFragment|null} */
    let $htmlNode = null;

    /** @type {?Directive} */
    let $htmlNodeDirective = null;

    /** @type {?ViewElementFragment} */
    let $children = null;

    const build = function() {
        if($viewDescription.name === SLOT_RENDER_TAG_NAME) {
            const slot = $viewProps.componentInstance.getSlot($viewDescription.slot || DEFAULT_SLOT_NAME);
            $htmlNode = document.createDocumentFragment();
            if(!slot) {
                throw new Error('Undefined Slot name '+ $viewDescription.slot);
            }
            $children = slot($htmlNode, getSlotLocalState);
            return;
        }
        $htmlNode = ($viewDescription.name) ? document.createElement($viewDescription.name) : document.createDocumentFragment();
        buildAttrs();
        if($viewDescription.content) {
           $children = (new ViewElementFragment($viewDescription.content, $viewProps));
        }
        if($viewDescription.directives) {
            $htmlNodeDirective = new Directive($htmlNode, $viewDescription.directives, $htmlAttributes, $viewProps, $lifecycleListeners);
        }
        buildEventsConnexion();
    };

    /**
     * @param {?string[]} slotProps
     *
     * @returns {?State}
     */
    const getSlotLocalState = function(slotProps) {
        if(!slotProps) {
            return null;
        }
        buildAttrs(false);
        const localState = new State();
        for(const attrName in $htmlAttributes) {
            if(!slotProps.includes(attrName)) {
                continue;
            }
            const attributeStateItem = localState.add(attrName, $htmlAttributes[attrName].value());
            $htmlAttributes[attrName].onUpdate((value) => {
                attributeStateItem.set(value);
            });
        }

        return localState;
    };
    /**
     * @param {boolean} isUpdateAttribute
     */
    const buildAttrs = function(isUpdateAttribute = true) {
        if(!$viewDescription.attrs) {
            return;
        }
        for(const attrName in $viewDescription.attrs) {
            $htmlAttributes[attrName] = (new ViewHtmlElementAttribute(
                $htmlNode,
                isUpdateAttribute ? attrName : '',
                $viewDescription.attrs[attrName],
                $viewProps
            ));
        }
    };

    /**
     * @param {HTMLElement|DocumentFragment} parentNode
     */
    const renderContent = (parentNode) => {
        build();
        if($children) {
            $children.render($htmlNode);
        }
        parentNode.append($htmlNode);
        $lifeCycleHandler.created();
        this.setAnchor($viewAnchor);
    };

    const buildEventsConnexion = function() {
        if(!$viewDescription.events) {
            return;
        }

        for(const eventPath in $viewDescription.events) {
            const eventSteps = eventPath.split('.');
            const eventName = eventSteps.pop();
            const actionName = $viewDescription.events[eventPath];
            const actionTemplate = new ActionTemplate(actionName, $viewProps);
            $htmlNode.addEventListener(eventName, function(event) {
                if(eventSteps.includes(EVENT_DIRECTIVE.PREVENT_DEFAULT)) {
                    event.preventDefault();
                }
                if(eventSteps.includes(EVENT_DIRECTIVE.STOP_PROPAGATION)) {
                    event.stopPropagation();
                }
                actionTemplate.handle(event);
            });
        }
    };

    this.beforeRenderProcess = function() {
        $lifeCycleHandler.beforeCreate();
    };

    /**
     * @param {HTMLElement|DocumentFragment} parentNode
     * @param {ViewIfStatement} ifStatement
     */
    this.renderProcess = function(parentNode, ifStatement) {
        parentNode.appendChild($viewAnchor);
        if(ifStatement && ifStatement.isFalse()) {
            return;
        }
        renderContent(parentNode);
    };

    this.unmountProcess = function() {
        $lifeCycleHandler.beforeUnmount();
        this.moveIntoFragment($htmlNode);
        if($htmlNode instanceof DocumentFragment) {
            $children.unmount();
        }
        this.setIsUnmounted();
        $lifeCycleHandler.unmounted();
    };

    /**
     * @param {ViewIfStatement} ifStatement
     */
    this.mountProcess = function(ifStatement) {
        if(ifStatement && ifStatement.isFalse()) {
            return;
        }
        $lifeCycleHandler.beforeMount();
        if($children === null) {
            const fragment = document.createDocumentFragment();
            renderContent(fragment);
            this.insertAfter(fragment, $viewAnchor);
            this.setIsMounted();
            return;
        }
        this.moveIntoParent();
        if($htmlNode instanceof DocumentFragment) {
            $children.mountProcess();
            this.insertAfter($htmlNode, $viewAnchor);
        }
        this.setIsMounted();
        $lifeCycleHandler.mounted();
    };

    this.removeProcess = function() {
        $lifeCycleHandler.beforeRemove();
        if(!$htmlNode) {
            $lifeCycleHandler.removed();
            return;
        }
        $viewAnchor.remove();
        $htmlNode.remove();
        if($children) {
            $children.remove();
        }
        this.setIsRemoved();
        $lifeCycleHandler.removed();
    };

    this.target = function() {
        return $htmlNode;
    };

    this.directive = function() {
        return $htmlNodeDirective;
    };
};

export default ViewHtmlElement;