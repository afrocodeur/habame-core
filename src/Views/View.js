import ViewElementFragment from "src/Views/ViewElementFragment";
import AbstractView from "src/Views/AbstractView";
import getSafeNode from "../Component/getSafeNode";
import ViewRefCollection from "./ViewRefCollection";

/**
 *
 * @param  {string|Array|object} $viewDescription
 * @param {App} $appInstance
 *
 *
 * @class
 * @extends AbstractView
 */
const View = function($viewDescription, $appInstance) {

    const $viewAnchor = document.createComment('');

    /** @type {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} */
    const $viewProps = {
        view: this,
        appInstance: $appInstance,
        componentInstance: null
    };

    AbstractView.call(this, { $viewDescription, $viewProps });

    const $viewFragment = new ViewElementFragment($viewDescription, $viewProps);

    /** @type {Object.<string, (Object.<string, Function>)|ViewRefCollection>} */
    const $references = {};

    /** @type  {?Component} */
    let $componentInstance = null;

    /**
     * @param {HTMLElement|DocumentFragment} parentNode
     * @param {ViewIfStatement} ifStatement
     */
    this.renderProcess = function(parentNode, ifStatement) {
        parentNode.appendChild($viewAnchor);
        if(ifStatement && ifStatement.isFalse()) {
            return;
        }
        $viewFragment.render(parentNode);
    };

    this.unmountProcess = function () {
        $viewFragment.unmount();
        this.setIsUnmounted();
    };

    /**
     * @param {ViewIfStatement} ifStatement
     */
    this.mountProcess = function(ifStatement) {
        if(ifStatement && ifStatement.isFalse()) {
            return;
        }
        if($viewFragment.isRendered()) {
            $viewFragment.mount();
        }
        else {
            const fragment = document.createDocumentFragment();
            $viewFragment.render(fragment);
            this.insertAfter(fragment, $viewAnchor);
        }
        this.setIsMounted();
    };

    this.removeProcess = function() {
        $viewFragment.remove();
        this.setIsRemoved();
    };

    /**
     * @param {Component} componentInstance
     */
    this.setComponentInstance = function(componentInstance) {
        $viewProps.componentInstance = componentInstance;
        $viewProps.getState = function(name) {
            if(this.localState) {
                const state = this.localState.get(name);
                if(state) {
                   return state;
                }
            }
            return componentInstance.getStateByName.apply($viewProps.componentInstance, [name]);
        };
        $componentInstance = componentInstance;
        $viewAnchor.textContent = componentInstance.getName() +' Component View Anchor';
    };

    /**
     * @param {string} name
     * @param {ViewHtmlElement|ViewComponentElement} viewElement
     */
    this.setReference = function(name, viewElement) {
        const refInstance = getSafeNode(viewElement);
        if($references[name] instanceof ViewRefCollection) {
            $references[name].push(refInstance);
            return;
        }
        $references[name] = refInstance;
    };
    /**
     * @param {string} name
     * @param {boolean} isCollection
     */
    this.cleanReference = function(name, isCollection) {
        if(isCollection === true) {
            if($references[name] instanceof ViewRefCollection) {
                $references[name].clean();
                return;
            }
            $references[name] = new ViewRefCollection();
            return;
        }
        $references[name] = undefined;
    };

    this.getReferences = function() {
        return $references;
    };

    this.getComponentInstance = function() {
        return $componentInstance;
    };

    this.updateViewDescription = function(viewDescription) {
        $viewFragment.updateViewDescription(viewDescription);
    };

};

export default View;