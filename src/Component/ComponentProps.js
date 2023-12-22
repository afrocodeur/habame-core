/**
 *
 * @param {Object.<string, Template>} $propTemplates
 * @param {Object.<string, Function>} $slots
 *
 * @class
 */
const ComponentProps = function($propTemplates = {}, $slots) {

    const updatePropsValues = () => {
        for (const propName in $propTemplates) {
            if(propName === 'onUpdate') {
                continue;
            }
            this[propName] = $propTemplates[propName].value();
        }
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

    ((() => { /* constructor */
        updatePropsValues();
        for (const propName in $propTemplates) {
            $propTemplates[propName].onUpdate(updatePropsValues);
        }
    })());

};

export default ComponentProps;