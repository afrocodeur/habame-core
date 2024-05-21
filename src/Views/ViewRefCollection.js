/**
 *
 * @constructor
 */
const ViewRefCollection = function() {

    const $references = [];

    this.clean = function() {
        $references.splice(0);
    };

    this.push = function(node) {
        $references.push(node);
    };

    /**
     * @param {Number} index
     * @returns {*}
     */
    this.target = function(index) {
        if(!$references[index]) {
            return null;
        }
        return $references[index].target();
    };

    /**
     * @param {Number} index
     * @returns {*}
     */
    this.get = function(index) {
        return $references[index];
    };

    /**
     * @param {Function} callback
     */
    this.each = function(callback) {
        $references.forEach(callback);
    };

};

export default ViewRefCollection;