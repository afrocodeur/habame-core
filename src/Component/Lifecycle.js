
/**
 * @param  {Object.<string, Function[]>} $listeners
 *
 * @class
 */
const Lifecycle =  function($listeners) {

    /** @param {Function} listener */
    this.onBeforeCreate = function(listener) {
        $listeners.beforeCreate.push(listener);
        return this;
    };

    /** @param {Function} listener */
    this.onCreated = function(listener) {
        $listeners.created.push(listener);
        return this;
    };

    /** @param {Function} listener */
    this.onBeforeMount = function(listener) {
        $listeners.beforeMount.push(listener);
        return this;
    };

    /** @param {Function} listener */
    this.onMounted = function(listener) {
        $listeners.mounted.push(listener);
        return this;
    };

    /** @param {Function} listener */
    this.onBeforeUnmount = function(listener) {
        $listeners.beforeUnmount.push(listener);
        return this;
    };

    /** @param {Function} listener */
    this.onUnmounted = function(listener) {
        $listeners.unmounted.push(listener);
        return this;
    };

    /** @param {Function} listener */
    this.onBeforeRemove = function(listener) {
        $listeners.beforeRemove.push(listener);
        return this;
    };

    /** @param {Function} listener */
    this.onRemove = function(listener) {
        $listeners.remove.push(listener);
        return this;
    };

    /** @param {Function} listener */
    this.onBeforeUpdate = function(listener) {
        $listeners.beforeUpdate.push(listener);
        return this;
    };

    /** @param {Function} listener */
    this.onUpdated = function(listener) {
        $listeners.updated.push(listener);
        return this;
    };

};

/**
 * @return {Object.<string, Function[]>}
 * @static
 */
Lifecycle.newListenersStore = function() {
    return {
        beforeCreate: [],
        created: [],
        beforeMount: [],
        mounted: [],
        beforeUnmount: [],
        unmounted: [],
        beforeRemove: [],
        removed: [],
        beforeUpdate: [],
        updated: []
    };
};

export default Lifecycle;