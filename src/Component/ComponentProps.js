/**
 *
 * @param {Object.<string, Template>} $propTemplates
 * @param {Object.<string, Function>} $slots
 *
 * @class
 */
const ComponentProps = function($propTemplates = {}, $slots = {}) {

    /**
     * @param {string} propName
     */
    const updatePropValue = (propName) => {
        this[propName] = $propTemplates[propName].value();
    };

    const updatePropsValues = () => {
        for (const propName in $propTemplates) {
            if(['onUpdate', 'all', 'getSlot'].includes(propName)) {
                continue;
            }
            updatePropValue(propName);
        }
    };

    /**
     * @param {string} propName
     * @returns {boolean}
     */
    this.exists = function(propName) {
        return Object.keys($propTemplates).includes(propName);
    };

    /**
     * @param {string} propName
     * @param {Template} template
     */
    this.add = function(propName, template) {
        if(this.exists(propName)) {
            return;
        }
        $propTemplates[propName] = template;
        template.onUpdate(updatePropsValues);
        updatePropValue(propName);
    };

    /**
     * @param {string} name
     * @param {Function} listener
     */
    this.onUpdate = function(name, listener) {
        if($propTemplates[name] === undefined) {
            throw new Error('undefined props ' + name);
        }
        $propTemplates[name].onUpdate(listener);
    };

    /**
     * @returns {Object.<string, *>}
     */
    this.all = function() {
        const props = {};
        for (const propName in $propTemplates) {
            props[propName] = $propTemplates[propName].value();
        }
        return props;
    };

    /**
     * @param {string} name
     *
     * @returns {?Function}
     */
    this.getSlot = function(name) {
        return $slots ? $slots[name] : null;
    };

    /**
     * @param {Object.<string, Function>} slots
     */
    this.updateSlots = function(slots) {
        $slots = slots;
    };

    /**
     * @param {string} propName
     * @returns {Template}
     */
    this.getTemplate = function(propName) {
        return $propTemplates[propName];
    };

    ((() => { /* constructor */
        updatePropsValues();
        for (const propName in $propTemplates) {
            $propTemplates[propName].onUpdate(updatePropsValues);
        }
    })());

};

export default ComponentProps;