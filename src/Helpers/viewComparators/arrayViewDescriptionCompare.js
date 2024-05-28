/**
 * @param {string|Array|Object} newDescription
 * @param {string|Array|Object} newDescriptionIndex
 * @param {ViewElementFragment[]} elements
 * @returns {{isSameIndex: boolean, element: ViewElementFragment}}
 */
const getExistingElement = function(newDescription, newDescriptionIndex, elements) {
    let isSameIndex = false;
    const element = elements.find((node, elementIndex) => {
        const description = node.getViewDescription();
        isSameIndex = elementIndex === newDescriptionIndex;
        if(typeof description === 'string') {
            return description === newDescription;
        }
        if(description.key && (description.key === newDescription.key)) {
            return true;
        }
        if(description.ref && (description.ref === newDescription.ref)) {
            return true;
        }
        if(JSON.stringify(description) === JSON.stringify(newDescription)) {
            return true;
        }
        if(description.component && (description.component === newDescription.component)) {
            return true;
        }

        return description.name && (description.name === newDescription.name);
    });

    return {
        isSameIndex,
        element
    };
};

/**
 * @param {string|Array|Object} newViewDescription
 * @param {string|Array|Object} oldViewDescription
 * @param {ViewElementFragment} elements
 * @returns {*[]}
 */
const arrayViewDescriptionCompare = function(newViewDescription, oldViewDescription, elements) {
    const diff = [];
    let oldElements = [...elements];

    newViewDescription.forEach((newDescription, index) => {
        if(newDescription === oldViewDescription[index]) {
            diff.push({ node: elements[index], viewDescription: null });
            return;
        }
        const existingElement = getExistingElement(newDescription, index, oldElements);
        if(existingElement.element) {
            diff.push({ node: existingElement.element, viewDescription: newDescription });
            oldElements = oldElements.filter((item) => (item !== existingElement.element));
            return;
        }
        diff.push(newDescription);
    });
    return diff;
};

export default arrayViewDescriptionCompare;