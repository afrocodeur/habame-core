import ViewDescriptionCompare from "../../Helpers/ViewDescriptionCompare";
import ViewElementFragment from "../ViewElementFragment";


const ViewElementFragmentDev = function({ $viewDescription, $fragmentElements, $callbacks }) {

    const { handleViewDescriptionElement, getParentNode } = $callbacks;

    this.updateViewDescription = function(viewDescription) {

        if(typeof $viewDescription !== typeof viewDescription) {
            return;
        }
        const firstElement = $fragmentElements[0];
        // TODO: How To update the fucking view
        if(typeof viewDescription === 'string') {
            console.log('update string view');
            firstElement.updateViewDescription(viewDescription);
            return;
        }
        if(typeof viewDescription !== 'object') {
            return;
        }
        if(Array.isArray(viewDescription)) {
            // Todo: compare two object and extract the différence
            const differences = ViewDescriptionCompare.array(viewDescription, $viewDescription, $fragmentElements);
            let previousNode = null;
            $fragmentElements.forEach((element) => {
                element.unmount();
                const isNotRemoved = differences.find((item) => {
                    return item?.node === element;
                });
                if(!isNotRemoved) {
                    element.remove();
                }
                // TODO: remove element who are not in the new fragment elements
            });
            const ifStatements = [];
            differences.forEach((item) => {
                if(item?.node && item.node instanceof ViewElementFragment) {
                    item.node.mount();
                    item.node.updateViewDescription(item.viewDescription);
                    previousNode = item.node;
                    return;
                }
                if(item) {
                    const newNode = handleViewDescriptionElement(item, ifStatements);
                    newNode.render(getParentNode());
                }
            });
            return;
        }
        if(viewDescription.component) {
            console.log('update component element');
            firstElement.updateViewDescription(viewDescription);
            return;
        }
        console.log('update native html element');
        firstElement.updateViewDescription(viewDescription);
        // TODO: Html node
    };

};

export default ViewElementFragmentDev;