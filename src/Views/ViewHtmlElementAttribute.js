import TextTemplateDescription from "src/Template/TextTemplateDescription";

const ATTR_MAPPERS =  {
    style: (value) => {
        return Object.keys(value).map((name) => name + ': ' + value[name] + ';').join(' ');
    },
    class: (value) => {
        return Object.keys(value).filter((name) => value[name]).join(' ');
    }
};

/**
 * @param {HTMLElement} $htmlNode
 * @param {string} $attrName
 * @param {string} $attrValue
 * @param {{view: View, componentInstance: Component, appInstance: App, localState: ?State, getState: Function }} $viewProps
 *
 * @class
 */
const ViewHtmlElementAttribute =  function($htmlNode, $attrName, $attrValue, $viewProps) {

    const $templateDescription = new TextTemplateDescription($attrValue, $viewProps);

    /** @type {{onUpdate: Function[]}} */
    const $listeners = { onUpdate: [] };
    /** @type {string[]} */
    const $directAttributesChange = ['value', 'checked'];

    /**
     * @param {string} value
     */
    const updateNodeAttribute = (value) => {
        if(!$attrName) {
            return;
        }
        if($directAttributesChange.indexOf($attrName) >= 0) {
            $htmlNode[$attrName] = value;
            return;
        }
        if(typeof $htmlNode.setAttribute !== 'function') {
            return;
        }
        $htmlNode.setAttribute($attrName, value);
    };

    /**
     * @param {string} listenerType
     * @param {?Array} params
     */
    const trigger = (listenerType, params) => {
        if(!$listeners[listenerType]) {
            return;
        }
        $listeners[listenerType].forEach((listener) => {
            listener.apply(listener, params || []);
        });
    };

    this.value = function() {
        const values = [];
        $templateDescription.each((part) => {
            const value = (!part.hasAState) ? part.value : part.template.value();
            if(typeof value !== 'object') {
                values.push(value);
                return;
            }
            const objectValue = ATTR_MAPPERS[$attrName] ? ATTR_MAPPERS[$attrName].apply(ATTR_MAPPERS, [value]) : value;
            values.push(objectValue);
        });
        const filteredValues = values.filter((value) => (value !== undefined && value !== null && value !== ''));
        if(filteredValues.length === 1) {
            return filteredValues[0];
        }
        return filteredValues.join(' ');
    };

    /**
     * @param {Function} listener
     */
    this.onUpdate = function(listener) {
        $listeners.onUpdate.push(listener);
    };

    ((() => { /* Constructor */
        updateNodeAttribute(this.value());
        $viewProps.componentInstance.getState().onUpdate($templateDescription.statesToWatch(), () => {
            const value = this.value();
            updateNodeAttribute(value);
            trigger('onUpdate', [value]);
        });
    })());
};

export default ViewHtmlElementAttribute;