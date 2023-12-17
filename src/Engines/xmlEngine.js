

const STRUCT_CONTROL_AND_LOOP_ATTRIBUTES = ['ref', 'if', 'else', 'elseif', 'repeat'];
const FRAGMENT_ACCEPTED_NAMES = ['fragment', 'habame'];

/**
 * @param {string|Document} viewTemplate
 * @returns {Object|string|Array}
 */
const xmlEngine = function(viewTemplate) {

    const view = [];
    let parsedDocument = viewTemplate
    if(!(viewTemplate instanceof Document)) {
        const parser = new DOMParser();
        parsedDocument = parser.parseFromString(`<habame>${viewTemplate}</habame>`, 'application/xhtml+xml');
    }

    const errorNode = parsedDocument.querySelector('parsererror');

    if(!errorNode) {
        return xmlNodeToJson(parsedDocument.activeElement);
    }

    return view;
};

const xmlNodeAttributeDescriptions =  function(nodeElement) {
    if(!nodeElement.getAttributeNames) {
        return {};
    }
    const attributes = { };
    const attributeNames = nodeElement.getAttributeNames();

    attributeNames.forEach(function(attributeName) {
        const attributePath = attributeName.split('.');
        const attributeValue = nodeElement.getAttribute(attributeName);
        if(attributePath.length === 1) {

            if(STRUCT_CONTROL_AND_LOOP_ATTRIBUTES.includes(attributeName.toLowerCase())) {
                attributes[attributeName] = attributeValue;
                return;
            }

            attributes.attrs = attributes.attrs || {};
            attributes.attrs[attributeName] = attributeValue;
            return;
        }
        const attributeType = attributePath.shift();
        const attributeSubName = attributePath.join('.');
        if(!attributes[attributeType]) {
            attributes[attributeType] = {}
        }
        attributes[attributeType][attributeSubName] = attributeValue;
    });

    return attributes;
};
const xmlNodeToJson =  function(nodeElement) {
    const element = {};
    const nodeTagName = nodeElement.tagName;
    if(nodeTagName && !FRAGMENT_ACCEPTED_NAMES.includes(nodeTagName.toLowerCase())) {
        const firstCharOfName = nodeTagName[0];
        if(firstCharOfName === firstCharOfName.toUpperCase()) {
            element.component = nodeTagName;
        }
        else {
            element.name = nodeTagName;
        }
    }

    if(nodeElement.children && nodeElement.children.length > 0) {
        const elementChildren = [];
        Array.from(nodeElement.childNodes).forEach((nodeChild) => {
            elementChildren.push(xmlNodeToJson(nodeChild));
        });
        element.content = (elementChildren.length === 1) ? elementChildren[0] : elementChildren;
    }
    else if(nodeElement.textContent) {
        element.content = nodeElement.textContent;
    }
    const attributeDescriptions = xmlNodeAttributeDescriptions(nodeElement);
    if(element.name === undefined && element.component === undefined && Object.keys(attributeDescriptions).length === 0) {
        return element.content;
    }
    for(const key in attributeDescriptions) {
        element[key] = attributeDescriptions[key];
    }
    return element;
};
export default xmlEngine;