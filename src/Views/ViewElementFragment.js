import ViewTextElement from "src/Views/ViewTextElement";
import ViewComponentElement from "src/Views/ViewComponentElement";
import ViewHtmlElement from "src/Views/ViewHtmlElement";
import ViewLoopFragment from "src/Views/ViewLoopFragment";
import AbstractView from "src/Views/AbstractView";

/**
 *
 * @param {string|Array|Object} $viewDescription
 * @param {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} $viewProps
 *
 * @class
 * @extends AbstractView
 */
const ViewElementFragment = function($viewDescription, $viewProps) {

    AbstractView.call(this, { $viewDescription, $viewProps, $isFragment: true });

    /**
     * @type {(ViewTextElement | ViewLoopFragment | ViewElementFragment | ViewComponentElement | ViewHtmlElement)[]}
     */
    const $fragmentElements = [];

    const buildFromArray = function() {
        const ifStatements = [];
        for(const element of $viewDescription) {
            if(typeof element === 'string') {
                const node = new ViewElementFragment(element, $viewProps);
                $fragmentElements.push(node);
                continue;
            }

            const viewDescriptionItem = { ...element };
            if(element.if) {
                ifStatements.push(element.if);
            }
            else if(element.else === '') {
                if (ifStatements.length === 0) {
                    throw new Error('Else without If');
                }
                viewDescriptionItem.if = transformElseIf(ifStatements);
            }
            else if(element.elseif) {
                if(ifStatements.length === 0) {
                    throw new Error('ElseIf without If');
                }
                viewDescriptionItem.if = transformElseIf(ifStatements, element.elseif);
                ifStatements.push(element.elseif);
            }
            else {
                ifStatements.splice(0);
            }
            const node = new ViewElementFragment(viewDescriptionItem, $viewProps);
            $fragmentElements.push(node);
        }
    };

    this.build = function() {
        if(!$viewProps.componentInstance) {
            return;
        }

        if(typeof  $viewDescription === 'string') {
            const node = new ViewTextElement($viewDescription, $viewProps);
            $fragmentElements.push(node);
            return;
        }
        if(typeof $viewDescription !== 'object') {
            return;
        }
        if($viewDescription.repeat) {
            const node = new ViewLoopFragment($viewDescription, $viewProps);
            $fragmentElements.push(node);
            return;
        }
        if(Array.isArray($viewDescription)) {
            buildFromArray();
            return;
        }
        if($viewDescription.component) {
            const node = new ViewComponentElement($viewDescription, $viewProps);
            $fragmentElements.push(node);
            if($viewDescription.ref) {
                $viewProps.view.setReference($viewDescription.ref, node);
            }
            return;
        }
        const node = new ViewHtmlElement($viewDescription, $viewProps);
        $fragmentElements.push(node);
        if($viewDescription.ref) {
            $viewProps.view.setReference($viewDescription.ref, node);
        }
    };

    /**
     * @param {HTMLElement|DocumentFragment} parentNode
     */
    this.renderProcess = function(parentNode) {
        this.build();
        for(const fragmentElement of $fragmentElements) {
            fragmentElement.render(parentNode);
        }
    };

    this.unmountProcess = function() {
        for(const fragmentElement of $fragmentElements) {
            fragmentElement.unmount();
        }
        this.setIsUnmounted();
    };

    this.mountProcess = function() {
        for(const fragmentElement of $fragmentElements) {
            fragmentElement.mount();
        }
        this.setIsMounted();
    };
    this.removeProcess = function() {
        for(const fragmentElement of $fragmentElements) {
            fragmentElement.remove();
        }
        this.setIsRemoved();
    };

};

const cleanConditionStatement = function(statementTemplate) {
    if(/^\(/.test(statementTemplate) && /\)$/.test(statementTemplate)) {
        return statementTemplate;
    }

    return '(' + statementTemplate.trim() + ')';
};

/**
 * @param {string[]} previousConditions
 * @param {string} currentIf
 *
 * @returns {string}
 */
const transformElseIf = function(previousConditions, currentIf) {
    const notStatementsCleaned = previousConditions.map(cleanConditionStatement);
    const notStatement = '!(' + notStatementsCleaned.join('||') + ')';

    if(!currentIf) {
        return notStatement;
    }

    return notStatement +' && (' + cleanConditionStatement(currentIf) + ')';
};

export default ViewElementFragment;