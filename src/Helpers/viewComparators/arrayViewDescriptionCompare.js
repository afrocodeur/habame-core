
const arrayViewDescriptionCompare = function(newViewDescription, oldViewDescription, elements) {
    const diff = [];
    console.log(oldViewDescription.length, elements.length);

    newViewDescription.forEach((newDescription, index) => {
        if(newDescription === oldViewDescription[index]) {
            diff[index] = { node: elements[index], viewDescription: null };
            return;
        }
        let isSameIndex = false;
        const alreadyCreated = elements.find((node, elementIndex) => {
            const description = node.getViewDescription();
            isSameIndex = elementIndex === index;
            if(typeof description === 'string') {
                return description === newDescription;
            }
            if(description.key && description.key === newDescription.key) {
                return true;
            }
            return JSON.stringify(description) === JSON.stringify(newDescription);
            // TODO: improve the view description comparison
        });
        if((isSameIndex && alreadyCreated)) {
            diff[index] = { node: alreadyCreated, viewDescription: newDescription };
            return;
        }
        diff[index] = newDescription;
    });
    return diff;
};

export default arrayViewDescriptionCompare;