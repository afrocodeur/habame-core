import ViewDescriptionCompare from "../../Helpers/ViewDescriptionCompare";
import ViewElementFragment from "../ViewElementFragment";

/**
 * @param {Object} arg
 * @param {string|Array|Object} arg.$viewDescription
 * @param {ViewElementFragment[]} arg.$fragmentElements
 * @param {{handleViewDescriptionElement: Function, getParentNode: Function}} arg.$callbacks
 *
 * @class
 */
const ViewElementFragmentDev = function({ $viewDescription, $fragmentElements, $callbacks }) {

    const { handleViewDescriptionElement, getParentNode, buildViewDescription } = $callbacks;

    const render = function(parentNode) {
        parentNode = parentNode || getParentNode();
        if(!parentNode) {
            return;
        }
        $fragmentElements.forEach((node) => {
            node.render(parentNode);
        });
    };

    /**
     * @param {string|Array|Object} viewDescription
     * @param {DocumentFragment|ParentNode|HTMLElement} parentNode
     */
    this.updateViewDescription = function(viewDescription, parentNode) {

        if(typeof $viewDescription !== typeof viewDescription) {
            $fragmentElements.forEach((node) => {
                node.remove();
            });
            $fragmentElements.splice(0);
            buildViewDescription(viewDescription);
            render(parentNode);
            return;
        }
        const firstElement = $fragmentElements[0];
        if(typeof viewDescription === 'string') {
            firstElement.updateViewDescription(viewDescription);
            return;
        }
        if(typeof viewDescription !== 'object') {
            return;
        }
        if(Array.isArray(viewDescription)) {
            // Todo: compare two object and extract the différence
            if(!Array.isArray($viewDescription)) {
                $viewDescription = [];
            }
            const differences = ViewDescriptionCompare.array(viewDescription, $viewDescription, $fragmentElements);
            $viewDescription.splice(0);
            $viewDescription.push(...viewDescription);
            const nodesToRemove = [];
            $fragmentElements.forEach((element, index) => {
                element.unmount(true);
                const isNotRemoved = differences.find((item) => {
                    return item?.node === element;
                });
                if(!isNotRemoved) {
                    element.remove();
                    nodesToRemove.push(element);
                }
            });

            nodesToRemove.forEach((elementToRemove) => {
                const index = $fragmentElements.findIndex((element) => element === elementToRemove);
                $fragmentElements.splice(index, 1);
            });

            const ifStatements = [];
            differences.forEach((item) => {
                if(item?.node && item.node instanceof ViewElementFragment) {
                    item.node.mount(true);
                    item.node.updateViewDescription(item.viewDescription);
                    return;
                }
                if(item) {
                    const newNode = handleViewDescriptionElement(item, ifStatements);
                    newNode.render(parentNode || getParentNode());
                }
            });
            return;
        }
        if(!viewDescription) {
            return;
        }
        $fragmentElements.forEach(() => {
            firstElement.updateViewDescription(viewDescription);
        });
    };

};

export default ViewElementFragmentDev;