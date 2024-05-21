import ViewDescriptionCompare from "../../Helpers/ViewDescriptionCompare";

const ViewHtmlElementDev = function({ $viewDescription, $callback }) {

    const { getChildren } = $callback;


    /**
     * @param {Object} viewDescription
     */
    this.updateViewDescription = function(viewDescription) {
        if(ViewDescriptionCompare.html(viewDescription, $viewDescription)) {

        }
        const children = getChildren();
        if(children) {
            children.updateViewDescription(viewDescription.content);
        }
    };

};

export default ViewHtmlElementDev;