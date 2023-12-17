import ViewIfStatement from "src/Views/ViewIfStatement";

/**
 *
 * @param {Object} arg
 * @param {string|Array|Object} arg.$viewDescription
 * @param {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} arg.$viewProps
 * @param {boolean} arg.$isFragment
 *
 * @class
 */
const AbstractView = function({ $viewDescription, $viewProps, $isFragment }) {

    const $viewState = { isRendered: false, isUnmount: false, isRemoved: false };

    /** @type {ViewIfStatement} */
    let $ifStatement = null;

    const $switchContainers =  {
        selfFragment: document.createDocumentFragment(),
        anchor: null, // the node anchor in the DOM
        parent: null // the node parent
    };

    const buildIfStatement = ()=> {
        if(!$viewDescription.if) {
            return;
        }
        if($ifStatement) {
            return;
        }
        $ifStatement = new ViewIfStatement($viewDescription.if, $viewProps);
        $ifStatement.watch((isTrue) => {
            if($viewProps.localState) {
                (!isTrue) ? $viewProps.localState.switchOff() : $viewProps.localState.switchOn();
            }
            (isTrue) ? this.mount() : this.unmount();
        });
    };

    /**
     *
     * @param {HTMLElement|DocumentFragment} parentNode
     */
    this.render = function(parentNode) {
        if(!parentNode || this.isRendered()) {
            return;
        }
        if($isFragment !== true) {
            buildIfStatement();
        }
        this.beforeRenderProcess ? this.beforeRenderProcess() : null;
        this.renderProcess(parentNode, $ifStatement);
        ($ifStatement && $ifStatement.isFalse()) ? this.setIsUnmounted() : this.setIsMounted();
        this.setIsRendered();
    };

    /**
     * @param {HTMLElement|DocumentFragment|Comment} nodeToInsert
     * @param {HTMLElement|DocumentFragment|Comment} targetNode
     */
    this.insertAfter = function(nodeToInsert, targetNode) {
        const nextElement = targetNode.nextSibling;
        if(!nextElement) {
            targetNode.parentNode.appendChild(nodeToInsert);
            return;
        }
        targetNode.parentNode.insertBefore(nodeToInsert, nextElement);
    };

    this.mount = function() {
        if(!$viewState.isUnmount) {
            return;
        }
        if(!this.mountProcess) {
            return;
        }
        this.mountProcess($ifStatement);
    }

    this.unmount = function() {
        if($viewState.isUnmount) {
            return;
        }
        if(!this.unmountProcess) {
            return;
        }
        this.unmountProcess();
    }

    this.remove = function() {
        if($viewState.isRemoved) {
            return;
        }
        if(!this.removeProcess) {
            return;
        }
        this.removeProcess();
    }

    this.setIsRendered = function() {
        $viewState.isRendered = true;
    };

    this.setIsMounted = function() {
        $viewState.isUnmount = false;
    };

    this.setIsRemoved = function() {
        $viewState.isRemoved = false;
    };

    this.setIsUnmounted = function() {
        $viewState.isUnmount = true;
    };

    this.isRendered = function() {
        return $viewState.isRendered;
    };

    this.isRemoved = function() {
        return $viewState.isRemoved;
    };

    /**
     * @param {HTMLElement} parentNode
     */
    this.setParent = function(parentNode) {
        $switchContainers.parent = parentNode;
    };

    /**
     * @param {HTMLElement|Comment} anchorNode
     */
    this.setAnchor = function(anchorNode) {
        $switchContainers.anchor = anchorNode;
    };

    /**
     * @param {HTMLElement | DocumentFragment | Text | Comment | (HTMLElement | DocumentFragment | Text | Comment)[]} node
     */
    this.moveIntoFragment = function(node) {
        if(Array.isArray(node)) {
            node.forEach((nodeItem) => {
                $switchContainers.selfFragment.appendChild(nodeItem);
            });
            return;
        }
        $switchContainers.selfFragment.appendChild(node);
    };

    this.moveIntoParent = function() {
        if($switchContainers.parent) {
            $switchContainers.parent.appendChild($switchContainers.selfFragment);
            return;
        }
        if(!$switchContainers.anchor) {
            return;
        }
        this.insertAfter($switchContainers.selfFragment, $switchContainers.anchor);
    };

    /**
     * @returns {DocumentFragment}
     */
    this.unMountedFragment = function() {
        return $switchContainers.selfFragment;
    };

};

export default AbstractView;