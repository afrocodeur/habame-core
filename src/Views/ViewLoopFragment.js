import LoopTemplateDescription from "src/Template/LoopTemplateDescription";
import ViewElementFragment from "src/Views/ViewElementFragment";
import State from "src/State/State";
import Template from "src/Template/Template";
import AbstractView from "src/Views/AbstractView";

/**
 * @param {Array|Object} $viewDescription
 * @param {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} $viewProps
 *
 * @class
 * @extends AbstractView
 */
const ViewLoopFragment = function($viewDescription, $viewProps) {

    AbstractView.call(this, { $viewDescription, $viewProps, $isFragment: true });

    const $viewAnchor = document.createComment('Loop Anchor Start : ' + $viewDescription.repeat);
    const $viewAnchorEnd = document.createComment('Loop Anchor End : ' + $viewDescription.repeat);
    const $nodeInstancesByKey = {
        store: {},
        current: [],
        last: []
    };
    const $viewDescriptionWithoutRepeat = { ...$viewDescription };
    $viewDescriptionWithoutRepeat.repeat = null;

    const $loopTemplate = new LoopTemplateDescription($viewDescription.repeat, $viewProps);
    const $loopExpressionDescription = $loopTemplate.expressionDescription();
    const $itemKeyName = $loopExpressionDescription.getIterableItemKeyName();
    const $itemValueName = $loopExpressionDescription.getIterableItemValueName();
    const keyState = new State({ [$itemKeyName]: '' });
    keyState.parent = $viewProps.localState ?? $viewProps.componentInstance.getState();
    const $keyTemplate = new Template($viewDescriptionWithoutRepeat.key || $itemKeyName, { ...$viewProps, localState: keyState});

    let $isBuild = false;

    const build = () => {
        $isBuild = false;
        this.insertAfter($viewAnchorEnd, $viewAnchor);
        updateIteration();
        $loopTemplate.onUpdate(() => {
            updateIteration(true);
        });
    };

    const updateIterationItem = function(iterable, index) {
        // TODO : create this own state or update it
        const stateData = { [$itemValueName]: iterable[index] };
        if($itemKeyName) {
            stateData[$itemKeyName] = index
        }
        const nodeKey = $keyTemplate.value(stateData);
        $nodeInstancesByKey.current.push(nodeKey);

        if($nodeInstancesByKey.store[nodeKey]) {
            const existingNode = $nodeInstancesByKey.store[nodeKey];
            existingNode.localState.set(stateData);
            return;
        }

        const localState = new State(stateData);
        localState.parent = ($viewProps.localState) ? $viewProps.localState : $viewProps.componentInstance.getState();
        const node = new ViewElementFragment($viewDescriptionWithoutRepeat, { ...$viewProps, localState });
        $nodeInstancesByKey.store[nodeKey] = {
            node,
            localState
        };
    }
    const updateIteration = function() {
        const iterable = $loopTemplate.getIterable();
        if($viewDescriptionWithoutRepeat.ref) {
            $viewProps.view.cleanReference($viewDescription.ref);
        }

        const iterableIsArray = Array.isArray(iterable);
        $nodeInstancesByKey.last = $nodeInstancesByKey.current;
        $nodeInstancesByKey.current = [];

        if(iterableIsArray) {
            for(let index = 0; index < iterable.length; index++) {
                updateIterationItem(iterable, index);
            }
        }
        else {
            for(const index in iterable) {
                updateIterationItem(iterable, index);
            }
        }

        updateDom();
    };

    const removeUselessElement = function() {
        for (const nodeKey of $nodeInstancesByKey.last) {
            if(!$nodeInstancesByKey.current.includes(nodeKey)) {
                // Think about reusable node
                $nodeInstancesByKey.store[nodeKey].node.remove();
                $nodeInstancesByKey.store[nodeKey] = null;
            }
        }
    };

    const updateDom = function() {
        removeUselessElement();

        // update existing elements or add new elements
        for (const nodeKey of $nodeInstancesByKey.current) {
            if($nodeInstancesByKey.last.includes(nodeKey)) {
                continue;
            }
            const fragment = document.createDocumentFragment();
            const node = $nodeInstancesByKey.store[nodeKey].node;
            if(node.isRendered()) {
                continue;
            }
            node.render(fragment);
            if($viewAnchorEnd.parentNode) {
                $viewAnchorEnd.parentNode.insertBefore(fragment, $viewAnchorEnd);
            }
        }
    };


    /**
     * @param {HTMLElement|DocumentFragment} parentNode
     * @param {ViewIfStatement} ifStatement
     */
    this.renderProcess = function(parentNode, ifStatement) {
        parentNode.appendChild($viewAnchor);
        this.setAnchor($viewAnchor);
        if(ifStatement && ifStatement.isFalse()) {
            return;
        }
        build();
    };

    this.unmountProcess = function() {
        for (const nodeKey of $nodeInstancesByKey.current) {
            $nodeInstancesByKey.store[nodeKey].node.unmount();
        }
        this.moveIntoFragment($viewAnchorEnd);
        this.setIsUnmounted();
    };

    /**
     * @param {ViewIfStatement} ifStatement
     */
    this.mountProcess = function(ifStatement) {
        if(ifStatement && ifStatement.isFalse()) {
            return;
        }
        if($isBuild) {
            for (const nodeKey of $nodeInstancesByKey.current) {
                $nodeInstancesByKey.store[nodeKey].node.mount();
            }
            const nextElement = $viewAnchor.nextSibling;
            if(!nextElement) {
                $viewAnchor.parentNode.appendChild(this.unMountedFragment())
            }
            $viewAnchor.parentNode.insertBefore(this.unMountedFragment(), $viewAnchor);
        }
        else {
            build();
        }
        this.setIsMounted();
    };

    this.removeProcess = function() {
        for (const nodeKey of $nodeInstancesByKey.current) {
            $nodeInstancesByKey.store[nodeKey].node.remove();
        }
        $viewAnchor.remove();
        $viewAnchorEnd.remove();
        this.setIsRemoved();
    };

};

export default ViewLoopFragment;